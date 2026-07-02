import "server-only";

import {
  MAX_RATE_LIMIT_WAIT_MS_DEV,
  MAX_RATE_LIMIT_WAIT_MS_PROD,
  MIN_RATE_LIMIT_RETRY_MS,
  RATE_LIMIT_RESET_BUFFER_MS,
  TOKEN_BUCKET_CAPACITY,
  TOKEN_BUCKET_RATE_PER_MIN,
} from "./constants";

type AniListRateLimitState = {
  limit: number | null;
  remaining: number | null;
  resetAtMs: number | null;
};

type TokenBucketConfig = {
  ratePerMin: number;
  capacity: number;
  minSpacingMs: number;
  maxWaitMs: number;
};

const headerState: AniListRateLimitState = {
  limit: null,
  remaining: null,
  resetAtMs: null,
};

const tokenBucket = {
  tokens: TOKEN_BUCKET_CAPACITY,
  lastRefillMs: Date.now(),
  lastRequestMs: 0,
  headerPauseUntilMs: 0,
};

/** Serialize reserve + consume so parallel callers cannot bypass spacing. */
let bucketLock: Promise<void> = Promise.resolve();

function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

/** Evaluated at runtime — bundlers may inline NODE_ENV at module load for constants.ts. */
function getTokenBucketConfig(): TokenBucketConfig {
  if (isDevelopment()) {
    const ratePerMin = 60;
    return {
      ratePerMin,
      capacity: 8,
      minSpacingMs: 400,
      maxWaitMs: MAX_RATE_LIMIT_WAIT_MS_DEV,
    };
  }

  const ratePerMin = TOKEN_BUCKET_RATE_PER_MIN;
  return {
    ratePerMin,
    capacity: TOKEN_BUCKET_CAPACITY,
    minSpacingMs: Math.ceil(60_000 / ratePerMin),
    maxWaitMs: MAX_RATE_LIMIT_WAIT_MS_PROD,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withBucketLock<T>(fn: () => Promise<T>): Promise<T> {
  let releaseLock!: () => void;
  const locked = new Promise<void>((resolve) => {
    releaseLock = resolve;
  });
  const previous = bucketLock;
  bucketLock = locked;
  await previous;
  try {
    return await fn();
  } finally {
    releaseLock();
  }
}

function shouldLogRateLimit(): boolean {
  return isDevelopment() || process.env.ANILIST_LOG_RATE_LIMIT === "1";
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

function refillTokens(now: number, config: TokenBucketConfig): void {
  const elapsed = now - tokenBucket.lastRefillMs;
  if (elapsed <= 0) {
    return;
  }

  const tokensToAdd = Math.floor((elapsed / 60_000) * config.ratePerMin);
  if (tokensToAdd > 0) {
    tokenBucket.tokens = Math.min(config.capacity, tokenBucket.tokens + tokensToAdd);
    tokenBucket.lastRefillMs = now;
  }
}

function pauseTokenBucketUntil(untilMs: number): void {
  tokenBucket.headerPauseUntilMs = Math.max(tokenBucket.headerPauseUntilMs, untilMs);
}

function getTokenBucketWaitMs(config: TokenBucketConfig, now = Date.now()): number {
  refillTokens(now, config);

  if (tokenBucket.headerPauseUntilMs > now) {
    return tokenBucket.headerPauseUntilMs - now;
  }

  const spacingWait = Math.max(0, config.minSpacingMs - (now - tokenBucket.lastRequestMs));

  if (tokenBucket.tokens >= 1) {
    return spacingWait;
  }

  const msPerToken = 60_000 / config.ratePerMin;
  const refillWait = msPerToken - ((now - tokenBucket.lastRefillMs) % msPerToken);
  return Math.max(spacingWait, refillWait);
}

function consumeToken(config: TokenBucketConfig, now = Date.now()): void {
  refillTokens(now, config);
  tokenBucket.tokens = Math.max(0, tokenBucket.tokens - 1);
  tokenBucket.lastRequestMs = now;
}

function refreshExpiredHeaderWindow(now: number): void {
  if (headerState.resetAtMs === null || now < headerState.resetAtMs + RATE_LIMIT_RESET_BUFFER_MS) {
    return;
  }

  headerState.remaining = headerState.limit;
  headerState.resetAtMs = null;
}

export function updateAniListRateLimitFromHeaders(headers: Headers): void {
  const limit = parsePositiveInteger(headers.get("x-ratelimit-limit"));
  const remaining = parsePositiveInteger(headers.get("x-ratelimit-remaining"));
  const resetAtMs = parseRateLimitResetAtMs(headers);

  if (limit === undefined && remaining === undefined && resetAtMs === undefined) {
    return;
  }

  if (limit !== undefined) {
    headerState.limit = limit;
  }

  if (remaining !== undefined) {
    headerState.remaining = remaining;
  }

  if (resetAtMs !== undefined) {
    headerState.resetAtMs = resetAtMs;
  }
}

/** Advisory only — not used for proactive throttling (headers can lie during degradation). */
export function getAniListRateLimitWaitMs(now = Date.now()): number {
  refreshExpiredHeaderWindow(now);

  if (headerState.remaining === null || headerState.remaining > 0) {
    return 0;
  }

  if (headerState.resetAtMs !== null) {
    return Math.max(0, headerState.resetAtMs + RATE_LIMIT_RESET_BUFFER_MS - now);
  }

  headerState.resetAtMs = now + MIN_RATE_LIMIT_RETRY_MS;
  return MIN_RATE_LIMIT_RETRY_MS;
}

export function markAniListRateLimitExceeded(headers: Headers): number {
  updateAniListRateLimitFromHeaders(headers);

  headerState.remaining = 0;
  const now = Date.now();

  const retryAfterMs = parseRetryAfterMs(headers);
  if (retryAfterMs !== undefined) {
    headerState.resetAtMs = now + retryAfterMs;
    pauseTokenBucketUntil(now + retryAfterMs + RATE_LIMIT_RESET_BUFFER_MS);
    return retryAfterMs;
  }

  if (headerState.resetAtMs !== null && headerState.resetAtMs > now) {
    const waitMs = headerState.resetAtMs + RATE_LIMIT_RESET_BUFFER_MS - now;
    pauseTokenBucketUntil(now + waitMs);
    return waitMs;
  }

  headerState.resetAtMs = now + MIN_RATE_LIMIT_RETRY_MS;
  pauseTokenBucketUntil(now + MIN_RATE_LIMIT_RETRY_MS + RATE_LIMIT_RESET_BUFFER_MS);
  return MIN_RATE_LIMIT_RETRY_MS;
}

/**
 * Proactive gate: local token bucket plus 429 header pause.
 * Waits under a process-wide lock, then consumes one token atomically.
 * If the wait budget is exhausted, proceeds anyway so backup cache / 429 retry can handle it.
 */
export async function reserveAniListRequest(): Promise<void> {
  return withBucketLock(async () => {
    const config = getTokenBucketConfig();
    let waitedMs = 0;

    while (true) {
      const waitMs = getTokenBucketWaitMs(config);
      if (waitMs <= 0) {
        consumeToken(config);
        return;
      }

      const remainingBudget = config.maxWaitMs - waitedMs;
      if (remainingBudget <= 0) {
        if (shouldLogRateLimit()) {
          console.warn(
            `[anilist-rate] wait budget exceeded (${waitedMs}ms); proceeding with request`,
          );
        }
        consumeToken(config);
        return;
      }

      const sleepMs = Math.min(waitMs, remainingBudget);

      if (shouldLogRateLimit()) {
        console.warn(`[anilist-rate] token wait ${sleepMs}ms`);
      }

      await sleep(sleepMs);
      waitedMs += sleepMs;
    }
  });
}
