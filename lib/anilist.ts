import "server-only";
import { AniListError } from "./anilist-errors";

const ENDPOINT = process.env.ANILIST_ENDPOINT ?? "https://graphql.anilist.co";
const USER_AGENT = "AniNext/0.1 (+https://ani-next.vercel.app)";
// Per-attempt network cap. Short enough that a stalled socket can be retried
// inside the total budget instead of consuming it whole (a 15s cap left ~5s —
// not enough for a second full attempt, so one stall failed the render).
const REQUEST_TIMEOUT_MS = 8_000;
// Budget for work actually spent on AniList: network attempts plus their
// backoffs. Time queued behind the concurrency cap or held by a 429 gate is
// excluded, so a cold render no longer reports a timeout for a request that
// never got a chance to run.
const TOTAL_BUDGET_MS = 20_000;
// Hard cap on waiting for a concurrency slot, so a saturated queue fails loudly
// instead of hanging the render.
const MAX_QUEUE_WAIT_MS = 10_000;
// A 429 gate longer than this is surfaced as rate_limited instead of being
// slept through.
const MAX_RATE_LIMIT_WAIT_MS = 10_000;

const MAX_CONCURRENT = 3;
let activeRequestCount = 0;
const requestQueue: (() => void)[] = [];

// Degraded upstream: 30 req/min. Pace request starts so bursts can't burn the
// whole window at once, and gate all starts behind a shared 429 backoff.
const MIN_START_INTERVAL_MS = 300;
let lastRequestStartMs = 0;
let rateLimitedUntilMs = 0;

// Sliding window rate limiter (adaptive limit starting at 30, floor 10, ceiling 30)
const requestLog: number[] = [];
const WINDOW_MS = 60_000;
const MIN_LIMIT = 10;
const MAX_LIMIT = 30;
let effectiveLimit = 30;
let lastLimitAdjustMs = 0;
const RECOVERY_INTERVAL_MS = 120_000;

// Circuit Breaker state
const failureTimestamps: number[] = [];
const FAILURE_WINDOW_MS = 30_000;
const FAILURE_THRESHOLD = 12;
const OPEN_DURATION_MS = 12_000;
const MAX_OPEN_DURATION_MS = 60_000;
let circuitOpenUntil = 0; // epoch ms; 0 = closed
let isHalfOpen = false;
let currentOpenDurationMs = OPEN_DURATION_MS;

const MAX_WORTH_RETRYING_MS = 8_000;

const inFlightMap = new Map<string, Promise<unknown>>();

// Dev-only origin pressure stats: proves whether the per-instance limiter
// (#3) actually holds under real browsing, before tuning it blindly.
// Zero prod impact — gated on NODE_ENV and throttled to one line.
const originStats = { requests: 0, retries429: 0, dedupHits: 0, circuitOpens: 0 };

function noteOriginEvent(event: "request" | "retry429" | "dedupHit" | "circuitOpen") {
  if (process.env.NODE_ENV === "production") return;
  if (event === "request") originStats.requests += 1;
  else if (event === "retry429") originStats.retries429 += 1;
  else if (event === "dedupHit") originStats.dedupHits += 1;
  else originStats.circuitOpens += 1;
  if (originStats.requests % 20 === 0 || event === "circuitOpen") {
    console.debug(
      `[AniList] origin pressure: ${originStats.requests} req, ` +
        `${originStats.retries429} 429-retries, ${originStats.dedupHits} dedup hits, ` +
        `${originStats.circuitOpens} circuit opens (limit ${effectiveLimit}/min)`,
    );
  }
}

function wait(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function jitter(ms: number) {
  return Math.round(ms * (0.6 + Math.random() * 0.8));
}

async function respectLocalBudget(): Promise<void> {
  const now = Date.now();
  if (now < rateLimitedUntilMs) {
    const gateRemaining = rateLimitedUntilMs - now;
    if (gateRemaining > MAX_RATE_LIMIT_WAIT_MS) {
      throw new AniListError(
        "AniList rate limit hit",
        "rate_limited",
        Math.ceil(gateRemaining / 1000),
        429,
      );
    }
    await wait(gateRemaining);
    return;
  }
  const sinceLastStart = now - lastRequestStartMs;
  if (lastRequestStartMs > 0 && sinceLastStart < MIN_START_INTERVAL_MS) {
    await wait(MIN_START_INTERVAL_MS - sinceLastStart);
    return respectLocalBudget();
  }
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
  const stamped = Date.now();
  requestLog.push(stamped);
  lastRequestStartMs = stamped;
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

function isTimeoutError(error: unknown): boolean {
  return error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError");
}

function toNetworkError(error: unknown, status?: number): AniListError {
  if (error instanceof AniListError) return error;

  const timedOut = isTimeoutError(error);
  return new AniListError(
    timedOut ? "AniList request timed out" : "AniList request failed",
    "network",
    undefined,
    status,
  );
}

function onSuccess() {
  failureTimestamps.length = 0;
  circuitOpenUntil = 0;
  isHalfOpen = false;
  currentOpenDurationMs = OPEN_DURATION_MS;

  const now = Date.now();
  if (now - lastLimitAdjustMs > RECOVERY_INTERVAL_MS && effectiveLimit < MAX_LIMIT) {
    effectiveLimit = Math.min(MAX_LIMIT, effectiveLimit + 5);
    lastLimitAdjustMs = now;
  }
}

function onRateLimitHit(retryAfterSeconds?: number) {
  effectiveLimit = Math.max(MIN_LIMIT, Math.floor(effectiveLimit * 0.7));
  lastLimitAdjustMs = Date.now();
  // Shared gate: one 429 pauses every queued request, not just the unlucky one.
  const retryAfterMs =
    typeof retryAfterSeconds === "number" && Number.isFinite(retryAfterSeconds)
      ? retryAfterSeconds * 1000
      : 5000;
  const gateMs = Math.min(Math.max(retryAfterMs, 1000), 30_000);
  rateLimitedUntilMs = Math.max(rateLimitedUntilMs, Date.now() + gateMs);
}

function onUltimateFailure() {
  const now = Date.now();
  failureTimestamps.push(now);
  while (failureTimestamps.length > 0 && now - failureTimestamps[0] > FAILURE_WINDOW_MS) {
    failureTimestamps.shift();
  }

  if (failureTimestamps.length >= FAILURE_THRESHOLD || isHalfOpen) {
    circuitOpenUntil = now + currentOpenDurationMs;
    noteOriginEvent("circuitOpen");
    failureTimestamps.length = 0;
    isHalfOpen = false;
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
    circuitOpenUntil = 0;
    isHalfOpen = true;
  }
}

async function track<T>(run: () => Promise<T>): Promise<T> {
  if (activeRequestCount >= MAX_CONCURRENT) {
    await new Promise<void>((resolve, reject) => {
      const wake = () => {
        clearTimeout(timer);
        resolve();
      };
      const timer = setTimeout(() => {
        const index = requestQueue.indexOf(wake);
        if (index !== -1) requestQueue.splice(index, 1);
        reject(new AniListError("AniList request queue is full", "network"));
      }, MAX_QUEUE_WAIT_MS);
      requestQueue.push(wake);
    });
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
    noteOriginEvent("dedupHit");
    return existing as Promise<T>;
  }

  const promise = (async (): Promise<T> => {
    // Only the network attempts and their backoffs count against the budget —
    // queueing and 429 gates are bounded separately above.
    let spentMs = 0;

    const attempt = async (remaining: number): Promise<T> => {
      await respectLocalBudget();

      let res: Response;
      let fetchError: unknown = null;
      const attemptTimeoutMs = Math.max(1_000, TOTAL_BUDGET_MS - spentMs);

      try {
        noteOriginEvent("request");
        res = await track(() => {
          const dispatchedAt = Date.now();
          return fetch(ENDPOINT, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "User-Agent": USER_AGENT,
            },
            body: JSON.stringify({ query, variables }),
            signal: AbortSignal.timeout(Math.min(REQUEST_TIMEOUT_MS, attemptTimeoutMs)),
          }).finally(() => {
            spentMs += Date.now() - dispatchedAt;
          });
        });
      } catch (error) {
        fetchError = error;
        res = null as unknown as Response;
      }

      if (fetchError != null || !res) {
        const timedOut = isTimeoutError(fetchError);
        // A stalled socket usually clears on a fresh connection, so timeouts
        // retry quickly — but only when a whole new attempt still fits in the
        // budget. Otherwise the remainder is too short to succeed and the
        // request fails fast instead of hanging the render twice over.
        const retryFits = !timedOut || spentMs + REQUEST_TIMEOUT_MS <= TOTAL_BUDGET_MS;
        if (remaining > 0 && spentMs < TOTAL_BUDGET_MS && retryFits) {
          const attemptIndex = retries - remaining;
          const backoff = timedOut
            ? jitter(250)
            : jitter(Math.min(3000, Math.round(300 * Math.pow(2, attemptIndex))));
          await wait(backoff);
          spentMs += backoff;
          return attempt(remaining - 1);
        }
        onUltimateFailure();
        throw toNetworkError(fetchError);
      }

      if (res.status === 429) {
        const retryAfter = retryAfterSeconds(res.headers, 5);
        onRateLimitHit(retryAfter);
        const retryAfterMs = retryAfter * 1000;

        if (retryAfterMs <= MAX_WORTH_RETRYING_MS && remaining > 0 && spentMs < TOTAL_BUDGET_MS) {
          noteOriginEvent("retry429");
          const backoff = jitter(retryAfterMs);
          await wait(backoff);
          spentMs += backoff;
          return attempt(remaining - 1);
        }
        onUltimateFailure();
        throw new AniListError("AniList rate limit hit", "rate_limited", retryAfter, 429);
      }

      if (res.status === 403) {
        onUltimateFailure();
        let msg = "AniList API temporarily unavailable";
        try {
          const json = (await res.json()) as { errors?: { message: string }[] };
          if (json?.errors?.[0]?.message) {
            msg = json.errors[0].message;
          }
        } catch {
          // ignore parse error
        }
        throw new AniListError(msg, "outage", undefined, 403);
      }

      if (res.status >= 500 && res.status < 600) {
        if (remaining > 0 && spentMs < TOTAL_BUDGET_MS) {
          const attemptIndex = retries - remaining;
          const backoff = jitter(Math.min(3000, Math.round(300 * Math.pow(2, attemptIndex))));
          await wait(backoff);
          spentMs += backoff;
          return attempt(remaining - 1);
        }
        onUltimateFailure();
        let msg = `AniList server error (${res.status})`;
        try {
          const json = (await res.json()) as { errors?: { message: string }[] };
          if (json?.errors?.[0]?.message) {
            msg = json.errors[0].message;
          }
        } catch {
          // ignore parse error
        }
        throw new AniListError(msg, "outage", undefined, res.status);
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
        if (remaining > 0 && spentMs < TOTAL_BUDGET_MS) {
          const attemptIndex = retries - remaining;
          const backoff = jitter(Math.min(3000, Math.round(300 * Math.pow(2, attemptIndex))));
          await wait(backoff);
          spentMs += backoff;
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

    // The wall-clock race is gone: it fired while requests were still queued.
    // Each attempt is bounded by what is left of the network budget instead.
    return attempt(retries);
  })().finally(() => {
    inFlightMap.delete(key);
  });

  inFlightMap.set(key, promise);
  return promise;
}
