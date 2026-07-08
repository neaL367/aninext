import "server-only";

import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { print } from "graphql";
import {
  ANILIST_API_URL,
  MAX_RATE_LIMIT_RETRIES_WITH_RETRY_AFTER,
  MAX_RETRIES,
  MIN_RATE_LIMIT_RETRY_MS,
  REQUEST_TIMEOUT_MS,
  RETRY_JITTER_RATIO,
  SLOW_REQUEST_MS,
} from "./constants";
import { AniListError } from "@/lib/anilist/domain/errors";
import { withConcurrencyLimit, type ConcurrencyLane } from "./concurrency";
import {
  getAniListRateLimitWaitMs,
  markAniListRateLimitExceeded,
  reserveAniListRequest,
  updateAniListRateLimitFromHeaders,
} from "./rate-limit";

/**
 * Circuit Breaker: Prevents cascading failures by stopping requests
 * to a failing downstream service for a period of time.
 */
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime: number | null = null;
  private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";

  private readonly FAILURE_THRESHOLD = 5;
  private readonly RESET_TIMEOUT_MS = 30_000;

  getState() {
    if (this.state === "OPEN" && this.lastFailureTime) {
      if (Date.now() - this.lastFailureTime > this.RESET_TIMEOUT_MS) {
        this.state = "HALF_OPEN";
      }
    }
    return this.state;
  }

  recordSuccess() {
    this.failures = 0;
    this.state = "CLOSED";
    this.lastFailureTime = null;
  }

  recordFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    if (this.failures >= this.FAILURE_THRESHOLD) {
      this.state = "OPEN";
    }
  }

  shouldAllowRequest(): boolean {
    const state = this.getState();
    return state === "CLOSED" || state === "HALF_OPEN";
  }
}

const breaker = new CircuitBreaker();

/** Request Coalescing: Deduplicates simultaneous identical GraphQL calls. */
const inFlightRequests = new Map<string, Promise<unknown>>();

function getRequestHash(
  document: TypedDocumentNode<unknown, unknown>,
  variables?: Record<string, unknown>,
): string {
  const query = getPrintedQuery(document);
  const varString = variables ? JSON.stringify(variables) : "null";
  return `${query}:${varString}`;
}

type GraphQLResponse<T> = {
  // ... (rest of the file)

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

/** Browse, tooltips, and detail pages use the interactive lane so home/airing cannot starve search. */
const INTERACTIVE_OPERATIONS = new Set([
  "MediaPage",
  "MediaCardTooltipBatch",
  "MediaDetail",
  "CharacterDetail",
  "StaffDetail",
]);

function getConcurrencyLane(operationName: string): ConcurrencyLane {
  return INTERACTIVE_OPERATIONS.has(operationName) ? "interactive" : "background";
}

function formatGraphQLLogLine(
  operationName: string,
  elapsedMs: number,
  variables?: Record<string, unknown>,
): string {
  const variableKeys = variables ? Object.keys(variables).sort().join(",") : "";
  const suffix = variableKeys ? ` vars={${variableKeys}}` : "";
  return `[anilist] ${operationName} ${elapsedMs}ms${suffix}`;
}

function logGraphQLRequest(
  operationName: string,
  elapsedMs: number,
  variables?: Record<string, unknown>,
): void {
  const line = formatGraphQLLogLine(operationName, elapsedMs, variables);

  if (process.env.NODE_ENV === "development") {
    console.log(line);
    return;
  }

  console.info(line);
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
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

function applyJitter(ms: number): number {
  const jitter = ms * RETRY_JITTER_RATIO * (Math.random() * 2 - 1);
  return Math.max(0, Math.round(ms + jitter));
}

function getRetryDelayMs(error: AniListError, attempt: number): number {
  if (error.code === "rate_limit") {
    const fromHeader = error.retryAfterMs;
    if (fromHeader != null && fromHeader > 0) {
      return applyJitter(fromHeader);
    }
    return applyJitter(Math.min(30_000, MIN_RATE_LIMIT_RETRY_MS * 2 ** attempt));
  }

  return applyJitter(2 ** attempt * 250);
}

function getMaxAttempts(error: AniListError | undefined): number {
  if (
    error instanceof AniListError &&
    error.code === "rate_limit" &&
    error.retryAfterMs != null &&
    error.retryAfterMs > 0
  ) {
    return MAX_RATE_LIMIT_RETRIES_WITH_RETRY_AFTER;
  }
  return MAX_RETRIES;
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
  updateAniListRateLimitFromHeaders(response.headers);

  if (elapsed > SLOW_REQUEST_MS) {
    console.warn(
      `[anilist] slow request ${formatGraphQLLogLine(operationName, elapsed, variables)}`,
    );
  }

  const rateLimitWaitMs = getAniListRateLimitWaitMs();

  if (response.status === 429) {
    const retryAfterMs = markAniListRateLimitExceeded(response.headers);
    throw new AniListError(
      "rate_limit",
      "AniList rate limit exceeded. Please try again shortly.",
      undefined,
      retryAfterMs,
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
      throw new AniListError("rate_limit", message, undefined, rateLimitWaitMs);
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
  if (!breaker.shouldAllowRequest()) {
    throw new AniListError(
      "circuit_breaker",
      "AniList API is currently experiencing issues. Please try again in a few moments.",
    );
  }

  let attempt = 0;
  let lastError: unknown;

  while (true) {
    try {
      await reserveAniListRequest();
      const operationName = getOperationName(document as TypedDocumentNode<unknown, unknown>);
      const lane = getConcurrencyLane(operationName);
      const result = await withConcurrencyLimit(() => fetchGraphQLOnce(document, variables), lane);

      breaker.recordSuccess();
      return result;
    } catch (error) {
      lastError = error;

      const isCriticalError =
        error instanceof AniListError && (error.code === "network" || error.code === "validation");

      if (isCriticalError) {
        breaker.recordFailure();
      }

      const retryable =
        error instanceof AniListError &&
        !error.proactiveGate &&
        (error.code === "rate_limit" || error.code === "network");
      const maxAttempts = getMaxAttempts(error instanceof AniListError ? error : undefined);
      if (!retryable || attempt >= maxAttempts) {
        break;
      }
      const delay =
        error instanceof AniListError
          ? getRetryDelayMs(error, attempt)
          : applyJitter(2 ** attempt * 250);

      if (
        error instanceof AniListError &&
        error.code === "rate_limit" &&
        (process.env.NODE_ENV === "development" || process.env.ANILIST_LOG_RATE_LIMIT === "1")
      ) {
        console.warn(`[anilist-rate] 429 retry-after ${delay}ms (attempt ${attempt + 1})`);
      }

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
  const hash = getRequestHash(document as any, variables as any);
  const inFlight = inFlightRequests.get(hash);

  if (inFlight) {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[anilist-coalesce] hooking into in-flight request: ${getOperationName(document as any)}`,
      );
    }
    return inFlight as Promise<TData>;
  }

  const promise = executeGraphQLWithRetry(document, variables);
  inFlightRequests.set(hash, promise);

  try {
    return await promise;
  } finally {
    inFlightRequests.delete(hash);
  }
}

/**
 * Executes a raw GraphQL query string. 
 * Used by API routes that receive queries from the client.
 */
export async function executeGraphQLRaw<TData>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<TData> {
  // Wrap raw query in a dummy TypedDocumentNode to reuse the retry/bucket logic
  const dummyDocument = {
    kind: "Document",
    definitions: [],
    loc: { start: 0, end: 0 },
  } as any;

  // Override getPrintedQuery for this specific call
  const originalGetPrintedQuery = (doc: any) => {
    if (doc === dummyDocument) return query;
    return print(doc);
  };

  // Since getPrintedQuery is internal, we'll use a simplified wrapper 
  // that mimics the execution path of executeGraphQLWithRetry.
  
  // Actually, the cleanest way is to just expose the retry/bucket loop 
  // for raw queries.
  return executeGraphQLWithRetryRaw<TData>(query, variables);
}

async function executeGraphQLWithRetryRaw<TData>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<TData> {
  if (!breaker.shouldAllowRequest()) {
    throw new AniListError(
      "circuit_breaker",
      "AniList API is currently experiencing issues. Please try again in a few moments.",
    );
  }

  let attempt = 0;
  let lastError: unknown;

  while (true) {
    try {
      await reserveAniListRequest();
      
      // Infer operation name for concurrency lanes
      const match = /(?:query|mutation)\s+(\w+)/.exec(query);
      const operationName = match?.[1] ?? "anonymous";
      const lane = getConcurrencyLane(operationName);
      
      const result = await withConcurrencyLimit(async () => {
        const started = Date.now();
        const response = await fetch(ANILIST_API_URL, {
          method: "POST",
          headers: buildGraphQLHeaders(),
          body: JSON.stringify({
            query,
            variables: variables ?? {},
          }),
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });

        const elapsed = Date.now() - started;
        logGraphQLRequest(operationName, elapsed, variables);
        updateAniListRateLimitFromHeaders(response.headers);

        if (response.status === 429) {
          const retryAfterMs = markAniListRateLimitExceeded(response.headers);
          throw new AniListError("rate_limit", "AniList rate limit exceeded", undefined, retryAfterMs);
        }

        const payload = await response.json();
        if (payload.errors?.length) {
          const message = payload.errors.map((e: any) => e.message).join("; ");
          throw new AniListError("graphql", message);
        }
        return payload.data;
      }, lane);

      breaker.recordSuccess();
      return result;
    } catch (error) {
      lastError = error;
      if (error instanceof AniListError && (error.code === "network" || error.code === "validation")) {
        breaker.recordFailure();
      }
      const retryable = error instanceof AniListError && (error.code === "rate_limit" || error.code === "network");
      if (!retryable || attempt >= MAX_RETRIES) break;
      await sleep(applyJitter(2 ** attempt * 250));
      attempt += 1;
    }
  }
  if (lastError instanceof AniListError) throw lastError;
  throw new AniListError("network", "AniList request failed after retries", lastError);
}
