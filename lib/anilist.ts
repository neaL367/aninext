import "server-only";
import { AniListError } from "./anilist-errors";

const ENDPOINT = "https://graphql.anilist.co";
const REQUEST_TIMEOUT_MS = 6_000;
const TOTAL_BUDGET_MS = 9_000;

const MAX_CONCURRENT = 4;
let activeRequestCount = 0;
const requestQueue: (() => void)[] = [];

// Sliding window rate limiter (adaptive limit starting at 30, floor 10, ceiling 30)
const requestLog: number[] = [];
const WINDOW_MS = 60_000;
const MIN_LIMIT = 10;
const MAX_LIMIT = 30;
let effectiveLimit = 30;
let lastLimitAdjustMs = 0;
const RECOVERY_INTERVAL_MS = 120_000;

// Circuit Breaker state
let consecutiveFailures = 0;
let circuitOpenUntil = 0; // epoch ms; 0 = closed
const FAILURE_THRESHOLD = 5;
const OPEN_DURATION_MS = 12_000;
const MAX_OPEN_DURATION_MS = 60_000;
let currentOpenDurationMs = OPEN_DURATION_MS;

const MAX_WORTH_RETRYING_MS = 8_000;

const inFlightMap = new Map<string, Promise<unknown>>();

function wait(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function jitter(ms: number) {
  return Math.round(ms * (0.6 + Math.random() * 0.8));
}

async function respectLocalBudget(): Promise<void> {
  const now = Date.now();
  while (requestLog.length > 0 && now - (requestLog[0] ?? 0) > WINDOW_MS) {
    requestLog.shift();
  }
  if (requestLog.length >= effectiveLimit) {
    const oldest = requestLog[0] ?? now;
    const rawWait = WINDOW_MS - (now - oldest) + Math.floor(Math.random() * 50) + 10;
    const waitMs = Math.min(rawWait, 1500);
    await wait(waitMs);
    return respectLocalBudget();
  }
  requestLog.push(Date.now());
}

function retryAfterSeconds(headers: Headers, fallback: number) {
  const retryAfterHeader = headers.get("Retry-After");
  const retryAfter = retryAfterHeader === null ? NaN : Number(retryAfterHeader);
  if (Number.isFinite(retryAfter) && retryAfter >= 0) return retryAfter;

  const resetHeader = headers.get("X-RateLimit-Reset");
  const reset = resetHeader === null ? NaN : Number(resetHeader);
  if (Number.isFinite(reset) && reset > 0) {
    return Math.max(0, Math.ceil(reset - Date.now() / 1000));
  }
  return fallback;
}

function toNetworkError(error: unknown, status?: number): AniListError {
  if (error instanceof AniListError) return error;

  const timedOut =
    error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError");
  return new AniListError(
    timedOut ? "AniList request timed out" : "AniList request failed",
    "network",
    undefined,
    status,
  );
}

function onSuccess() {
  consecutiveFailures = 0;
  circuitOpenUntil = 0;
  currentOpenDurationMs = OPEN_DURATION_MS;

  const now = Date.now();
  if (now - lastLimitAdjustMs > RECOVERY_INTERVAL_MS && effectiveLimit < MAX_LIMIT) {
    effectiveLimit = Math.min(MAX_LIMIT, effectiveLimit + 5);
    lastLimitAdjustMs = now;
  }
}

function onRateLimitHit() {
  effectiveLimit = Math.max(MIN_LIMIT, Math.floor(effectiveLimit * 0.7));
  lastLimitAdjustMs = Date.now();
}

function onUltimateFailure() {
  consecutiveFailures += 1;
  if (consecutiveFailures >= FAILURE_THRESHOLD) {
    circuitOpenUntil = Date.now() + currentOpenDurationMs;
    consecutiveFailures = 0;
    currentOpenDurationMs = Math.min(MAX_OPEN_DURATION_MS, currentOpenDurationMs * 2);
  }
}

function checkCircuitBreaker() {
  const now = Date.now();
  if (circuitOpenUntil > now) {
    const remainingSec = Math.ceil((circuitOpenUntil - now) / 1000);
    throw new AniListError("AniList is temporarily unavailable", "circuit_open", remainingSec);
  }
  if (circuitOpenUntil > 0) {
    circuitOpenUntil = now + currentOpenDurationMs;
  }
}

async function track<T>(run: () => Promise<T>): Promise<T> {
  if (activeRequestCount >= MAX_CONCURRENT) {
    await new Promise<void>((resolve) => requestQueue.push(resolve));
  } else {
    activeRequestCount += 1;
  }

  try {
    return await run();
  } finally {
    const next = requestQueue.shift();
    if (next) next();
    else activeRequestCount -= 1;
  }
}

export async function anilistFetch<T>(
  query: string,
  variables: Record<string, unknown>,
  retries = 2,
): Promise<T> {
  checkCircuitBreaker();

  const key = `${query}:${JSON.stringify(variables)}`;
  const existing = inFlightMap.get(key);
  if (existing) {
    return existing as Promise<T>;
  }

  const promise = (async (): Promise<T> => {
    const attempt = async (remaining: number): Promise<T> => {
      await respectLocalBudget();

      let res: Response;
      let fetchError: unknown = null;

      try {
        res = await track(() =>
          fetch(ENDPOINT, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({ query, variables }),
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
          }),
        );
      } catch (error) {
        fetchError = error;
        res = null as unknown as Response;
      }

      if (fetchError != null || !res) {
        if (remaining > 0) {
          const attemptIndex = retries - remaining;
          const backoff = jitter(Math.min(3000, Math.round(300 * Math.pow(2, attemptIndex))));
          await wait(backoff);
          return attempt(remaining - 1);
        }
        onUltimateFailure();
        throw toNetworkError(fetchError);
      }

      if (res.status === 429) {
        onRateLimitHit();
        const retryAfter = retryAfterSeconds(res.headers, 5);
        const retryAfterMs = retryAfter * 1000;

        if (retryAfterMs <= MAX_WORTH_RETRYING_MS && remaining > 0) {
          const backoff = jitter(retryAfterMs);
          await wait(backoff);
          return attempt(remaining - 1);
        }
        onUltimateFailure();
        throw new AniListError("AniList rate limit hit", "rate_limited", retryAfter, 429);
      }

      if (res.status === 403) {
        onUltimateFailure();
        throw new AniListError("AniList API temporarily unavailable", "outage", undefined, 403);
      }

      if (res.status >= 500 && res.status < 600) {
        if (remaining > 0) {
          const attemptIndex = retries - remaining;
          const backoff = jitter(Math.min(3000, Math.round(300 * Math.pow(2, attemptIndex))));
          await wait(backoff);
          return attempt(remaining - 1);
        }
        onUltimateFailure();
        throw new AniListError(
          `AniList server error (${res.status})`,
          "outage",
          undefined,
          res.status,
        );
      }

      if (!res.ok) {
        onUltimateFailure();
        throw new AniListError(
          `AniList request failed (${res.status})`,
          "network",
          undefined,
          res.status,
        );
      }

      let json: { errors?: { message: string }[]; data?: T | null };
      try {
        json = (await res.json()) as { errors?: { message: string }[]; data?: T | null };
      } catch (error) {
        if (remaining > 0) {
          const attemptIndex = retries - remaining;
          const backoff = jitter(Math.min(3000, Math.round(300 * Math.pow(2, attemptIndex))));
          await wait(backoff);
          return attempt(remaining - 1);
        }
        onUltimateFailure();
        throw toNetworkError(error, res.status);
      }

      if (json.data != null) {
        onSuccess();
        return json.data;
      }

      if (json.errors?.length) {
        onUltimateFailure();
        throw new AniListError(json.errors[0].message, "graphql", undefined, res.status);
      }

      onUltimateFailure();
      throw new AniListError("AniList returned an empty response", "outage", undefined, res.status);
    };

    let timerId: ReturnType<typeof setTimeout> | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timerId = setTimeout(() => {
        reject(new AniListError("AniList request timed out", "network"));
      }, TOTAL_BUDGET_MS);
      if (typeof timerId === "object" && timerId && "unref" in timerId) {
        (timerId as { unref: () => void }).unref();
      }
    });

    try {
      return await Promise.race([attempt(retries), timeoutPromise]);
    } finally {
      if (timerId) clearTimeout(timerId);
    }
  })().finally(() => {
    inFlightMap.delete(key);
  });

  inFlightMap.set(key, promise);
  return promise;
}
