import "server-only";

import {
  MAX_RATE_LIMIT_WAIT_MS,
  MIN_RATE_LIMIT_RETRY_MS,
  RATE_LIMIT_RESET_BUFFER_MS,
} from "./constants";

type AniListRateLimitState = {
  limit: number | null;
  remaining: number | null;
  resetAtMs: number | null;
};

const state: AniListRateLimitState = {
  limit: null,
  remaining: null,
  resetAtMs: null,
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parsePositiveInteger(value: string | null): number | undefined {
  if (value === null) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function parseRetryAfterMs(headers: Headers): number | undefined {
  const header = headers.get("retry-after");
  if (!header) {
    return undefined;
  }

  const seconds = Number(header);
  if (Number.isFinite(seconds)) {
    return Math.max(0, seconds * 1000);
  }

  const date = Date.parse(header);
  if (Number.isFinite(date)) {
    return Math.max(0, date - Date.now());
  }

  return undefined;
}

function parseRateLimitResetAtMs(headers: Headers): number | undefined {
  const reset = parsePositiveInteger(headers.get("x-ratelimit-reset"));
  return reset === undefined ? undefined : reset * 1000;
}

function refreshExpiredWindow(now: number): void {
  if (state.resetAtMs === null || now < state.resetAtMs + RATE_LIMIT_RESET_BUFFER_MS) {
    return;
  }

  state.remaining = state.limit;
  state.resetAtMs = null;
}

export function updateAniListRateLimitFromHeaders(headers: Headers): void {
  const limit = parsePositiveInteger(headers.get("x-ratelimit-limit"));
  const remaining = parsePositiveInteger(headers.get("x-ratelimit-remaining"));
  const resetAtMs = parseRateLimitResetAtMs(headers);

  if (limit === undefined && remaining === undefined && resetAtMs === undefined) {
    return;
  }

  if (limit !== undefined) {
    state.limit = limit;
  }

  if (remaining !== undefined) {
    state.remaining = remaining;
  }

  if (resetAtMs !== undefined) {
    state.resetAtMs = resetAtMs;
  }
}

export function getAniListRateLimitWaitMs(now = Date.now()): number {
  refreshExpiredWindow(now);

  if (state.remaining === null || state.remaining > 0) {
    return 0;
  }

  if (state.resetAtMs !== null) {
    return Math.max(0, state.resetAtMs + RATE_LIMIT_RESET_BUFFER_MS - now);
  }

  state.resetAtMs = now + MIN_RATE_LIMIT_RETRY_MS;
  return MIN_RATE_LIMIT_RETRY_MS;
}

export function markAniListRateLimitExceeded(headers: Headers): number {
  updateAniListRateLimitFromHeaders(headers);

  state.remaining = 0;
  const now = Date.now();

  const retryAfterMs = parseRetryAfterMs(headers);
  if (retryAfterMs !== undefined) {
    state.resetAtMs = now + retryAfterMs;
    return retryAfterMs;
  }

  if (state.resetAtMs !== null && state.resetAtMs > now) {
    return state.resetAtMs + RATE_LIMIT_RESET_BUFFER_MS - now;
  }

  state.resetAtMs = now + MIN_RATE_LIMIT_RETRY_MS;
  return MIN_RATE_LIMIT_RETRY_MS;
}

/**
 * Wait only when AniList headers already reported an empty bucket (429 or
 * x-ratelimit-remaining: 0). Do not decrement locally — concurrent serverless
 * invocations on a warm instance were falsely exhausting the bucket and
 * blocking for ~60s without sending any HTTP requests.
 */
export async function reserveAniListRequest(): Promise<void> {
  let waitedMs = 0;

  while (true) {
    const waitMs = getAniListRateLimitWaitMs();
    if (waitMs <= 0) {
      return;
    }

    const remainingBudget = MAX_RATE_LIMIT_WAIT_MS - waitedMs;
    if (remainingBudget <= 0) {
      console.warn(
        `[anilist] rate limit wait cap (${MAX_RATE_LIMIT_WAIT_MS}ms) reached; proceeding`,
      );
      return;
    }

    const sleepMs = Math.min(waitMs, remainingBudget);

    if (process.env.NODE_ENV === "development") {
      console.warn(`[anilist] rate limit bucket empty; waiting ${sleepMs}ms`);
    }

    await sleep(sleepMs);
    waitedMs += sleepMs;
  }
}
