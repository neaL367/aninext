import "server-only";

import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { print } from "graphql";
import {
  ANILIST_API_URL,
  MAX_RETRIES,
  MIN_RATE_LIMIT_RETRY_MS,
  REQUEST_TIMEOUT_MS,
  SLOW_REQUEST_MS,
} from "./constants";
import { AniListError } from "@/lib/anilist/domain/errors";
import { withConcurrencyLimit } from "./concurrency";

type GraphQLResponse<T> = {
  readonly data?: T;
  readonly errors?: readonly { message: string }[];
};

const printedQueries = new WeakMap<object, string>();

function getPrintedQuery(document: TypedDocumentNode<unknown, unknown>): string {
  const cached = printedQueries.get(document);
  if (cached) return cached;
  const printed = print(document);
  printedQueries.set(document, printed);
  return printed;
}

function getOperationName(document: TypedDocumentNode<unknown, unknown>): string {
  const query = getPrintedQuery(document);
  const match = /(?:query|mutation)\s+(\w+)/.exec(query);
  return match?.[1] ?? "anonymous";
}

function logGraphQLRequest(
  operationName: string,
  elapsedMs: number,
  variables?: Record<string, unknown>,
): void {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  const variableKeys = variables ? Object.keys(variables).sort().join(",") : "";
  const suffix = variableKeys ? ` vars={${variableKeys}}` : "";
  console.log(`[anilist] ${operationName} ${elapsedMs}ms${suffix}`);
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function parseRetryAfterMs(response: Response): number | undefined {
  const header = response.headers.get("retry-after");
  if (!header) return undefined;
  const seconds = Number(header);
  if (Number.isFinite(seconds)) {
    return seconds * 1000;
  }
  const date = Date.parse(header);
  if (Number.isFinite(date)) {
    return Math.max(0, date - Date.now());
  }
  return undefined;
}

function buildGraphQLHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (process.env.NODE_ENV === "development") {
    headers["Accept-Encoding"] = "identity";
  }

  return headers;
}

function getErrorName(error: unknown): string | undefined {
  return error instanceof Error ? error.name : undefined;
}

function isFetchNetworkError(error: unknown): boolean {
  const name = getErrorName(error);
  return name === "AbortError" || name === "TimeoutError" || error instanceof TypeError;
}

function isRateLimitMessage(message: string): boolean {
  return /rate limit|too many requests/i.test(message);
}

function getRetryDelayMs(error: AniListError, attempt: number): number {
  if (error.code === "rate_limit") {
    const fromHeader = error.retryAfterMs;
    if (fromHeader != null && fromHeader > 0) {
      return fromHeader;
    }
    return Math.min(30_000, MIN_RATE_LIMIT_RETRY_MS * 2 ** attempt);
  }

  return 2 ** attempt * 250;
}

async function fetchGraphQLOnce<TData, TVariables extends Record<string, unknown>>(
  document: TypedDocumentNode<TData, TVariables>,
  variables?: TVariables,
): Promise<TData> {
  const started = Date.now();
  let response: Response;
  try {
    response = await fetch(ANILIST_API_URL, {
      method: "POST",
      headers: buildGraphQLHeaders(),
      body: JSON.stringify({
        query: getPrintedQuery(document as TypedDocumentNode<unknown, unknown>),
        variables: variables ?? {},
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    if (isFetchNetworkError(error)) {
      throw new AniListError(
        "network",
        "AniList request failed before receiving a response",
        error,
      );
    }
    throw error;
  }

  const elapsed = Date.now() - started;
  const operationName = getOperationName(document as TypedDocumentNode<unknown, unknown>);
  logGraphQLRequest(operationName, elapsed, variables);

  if (process.env.NODE_ENV === "development" && elapsed > SLOW_REQUEST_MS) {
    console.warn(`[anilist] slow request ${operationName} ${elapsed}ms`);
  }

  if (response.status === 429) {
    throw new AniListError(
      "rate_limit",
      "AniList rate limit exceeded. Please try again shortly.",
      undefined,
      parseRetryAfterMs(response),
    );
  }

  let payload: GraphQLResponse<TData>;
  try {
    payload = (await response.json()) as GraphQLResponse<TData>;
  } catch (error) {
    if (!response.ok) {
      throw new AniListError(
        "network",
        `AniList request failed with status ${response.status}`,
        error,
      );
    }
    throw new AniListError("validation", "AniList response was not valid JSON", error);
  }

  // AniList returns HTTP 404 with `{ data: { Media: null }, errors: [...] }` for missing records.
  if (response.status === 404) {
    if (payload.data !== undefined) {
      return payload.data;
    }
    throw new AniListError(
      "not_found",
      payload.errors?.map((error) => error.message).join("; ") ?? "AniList resource not found",
    );
  }

  if (!response.ok) {
    throw new AniListError("network", `AniList request failed with status ${response.status}`);
  }

  if (payload.errors?.length) {
    const message = payload.errors.map((error) => error.message).join("; ");
    if (payload.errors.some((error) => isRateLimitMessage(error.message))) {
      throw new AniListError("rate_limit", message);
    }
    throw new AniListError("graphql", message);
  }

  if (!payload.data) {
    throw new AniListError("validation", "AniList response missing data");
  }

  return payload.data;
}

async function executeGraphQLWithRetry<TData, TVariables extends Record<string, unknown>>(
  document: TypedDocumentNode<TData, TVariables>,
  variables?: TVariables,
): Promise<TData> {
  let attempt = 0;
  let lastError: unknown;

  while (attempt <= MAX_RETRIES) {
    try {
      return await withConcurrencyLimit(() => fetchGraphQLOnce(document, variables));
    } catch (error) {
      lastError = error;
      const retryable =
        error instanceof AniListError && (error.code === "rate_limit" || error.code === "network");
      if (!retryable || attempt === MAX_RETRIES) {
        break;
      }
      const delay =
        error instanceof AniListError ? getRetryDelayMs(error, attempt) : 2 ** attempt * 250;
      await sleep(delay);
      attempt += 1;
    }
  }

  if (lastError instanceof AniListError) {
    throw lastError;
  }

  throw new AniListError("network", "AniList request failed after retries", lastError);
}

export async function executeGraphQL<TData, TVariables extends Record<string, unknown>>(
  document: TypedDocumentNode<TData, TVariables>,
  variables?: TVariables,
): Promise<TData> {
  return executeGraphQLWithRetry(document, variables);
}
