import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { print } from "graphql";
import {
  ANILIST_API_URL,
  MAX_RETRIES,
  REQUEST_TIMEOUT_MS,
  SLOW_REQUEST_MS,
} from "./constants";
import { AniListError } from "./errors";
import { withConcurrencyLimit } from "./concurrency";
import { buildRequestKey, dedupeRequest } from "./request-dedup";

type GraphQLResponse<T> = {
  readonly data?: T;
  readonly errors?: readonly { message: string }[];
};

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

async function fetchGraphQLOnce<TData, TVariables extends Record<string, unknown>>(
  document: TypedDocumentNode<TData, TVariables>,
  variables?: TVariables
): Promise<TData> {
  const started = Date.now();
  const response = await fetch(ANILIST_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "Accept-Encoding": "identity",
    },
    body: JSON.stringify({
      query: print(document),
      variables: variables ?? {},
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  const elapsed = Date.now() - started;
  if (
    process.env.NODE_ENV === "development" &&
    elapsed > SLOW_REQUEST_MS
  ) {
    console.warn(`[anilist] slow request ${elapsed}ms`);
  }

  if (response.status === 429) {
    throw new AniListError(
      "rate_limit",
      "AniList rate limit exceeded. Please try again shortly.",
      undefined,
      parseRetryAfterMs(response)
    );
  }

  if (!response.ok) {
    throw new AniListError(
      "network",
      `AniList request failed with status ${response.status}`
    );
  }

  const payload = (await response.json()) as GraphQLResponse<TData>;

  if (payload.errors?.length) {
    throw new AniListError(
      "graphql",
      payload.errors.map((error) => error.message).join("; ")
    );
  }

  if (!payload.data) {
    throw new AniListError("validation", "AniList response missing data");
  }

  return payload.data;
}

async function executeGraphQLWithRetry<
  TData,
  TVariables extends Record<string, unknown>,
>(
  document: TypedDocumentNode<TData, TVariables>,
  variables?: TVariables
): Promise<TData> {
  let attempt = 0;
  let lastError: unknown;

  while (attempt <= MAX_RETRIES) {
    try {
      return await fetchGraphQLOnce(document, variables);
    } catch (error) {
      lastError = error;
      const retryable =
        error instanceof AniListError &&
        (error.code === "rate_limit" || error.code === "network");
      if (!retryable || attempt === MAX_RETRIES) {
        break;
      }
      const delay =
        error instanceof AniListError && error.retryAfterMs
          ? error.retryAfterMs
          : 2 ** attempt * 250;
      await sleep(delay);
      attempt += 1;
    }
  }

  if (lastError instanceof AniListError) {
    throw lastError;
  }

  throw new AniListError(
    "network",
    "AniList request failed after retries",
    lastError
  );
}

export async function executeGraphQL<
  TData,
  TVariables extends Record<string, unknown>,
>(
  document: TypedDocumentNode<TData, TVariables>,
  variables?: TVariables
): Promise<TData> {
  const query = print(document);
  const key = buildRequestKey(query, variables);

  return dedupeRequest(key, () =>
    withConcurrencyLimit(() => executeGraphQLWithRetry(document, variables))
  );
}
