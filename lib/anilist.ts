import "server-only";
import { AniListError } from "./anilist-errors";

const ENDPOINT = "https://graphql.anilist.co";
const REQUEST_TIMEOUT_MS = 15_000;

const MAX_CONCURRENT = 4;
const BUDGET_HOLD_THRESHOLD = 5;
let activeRequestCount = 0;
const requestQueue: (() => void)[] = [];

const rateBudget = {
  remaining: Infinity,
  resetAt: 0,
};

function wait(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function jitter(ms: number) {
  return Math.round(ms * (0.6 + Math.random() * 0.8));
}

function updateBudget(headers: Headers) {
  const remainingHeader = headers.get("X-RateLimit-Remaining");
  const resetHeader = headers.get("X-RateLimit-Reset");
  const remaining = remainingHeader === null ? NaN : Number(remainingHeader);
  const reset = resetHeader === null ? NaN : Number(resetHeader);

  if (Number.isFinite(remaining) && remaining >= 0) rateBudget.remaining = remaining;
  if (Number.isFinite(reset) && reset > 0) rateBudget.resetAt = reset * 1000;
}

async function respectBudget() {
  while (rateBudget.remaining <= BUDGET_HOLD_THRESHOLD) {
    const hold = rateBudget.resetAt - Date.now();
    if (hold <= 0) {
      rateBudget.remaining = Infinity;
      rateBudget.resetAt = 0;
      break;
    }
    await wait(Math.min(hold, 3_000));
  }
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

function toNetworkError(error: unknown): AniListError {
  if (error instanceof AniListError) return error;

  const timedOut =
    error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError");
  return new AniListError(
    timedOut ? "AniList request timed out" : "AniList request failed",
    "network",
  );
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
  const attempt = async (remaining: number): Promise<T> => {
    await respectBudget();

    let res: Response;
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
      throw toNetworkError(error);
    }

    updateBudget(res.headers);

    if (res.status === 429) {
      if (remaining <= 0) {
        const retryAfter = retryAfterSeconds(res.headers, 30);
        throw new AniListError("AniList rate limit hit", "rate_limited", retryAfter);
      }
      const retryAfter = retryAfterSeconds(res.headers, 5);
      const backoff = Math.min(jitter(retryAfter * 1000), 10_000);
      await wait(backoff);
      return attempt(remaining - 1);
    }
    if (res.status === 403) {
      throw new AniListError("AniList API temporarily unavailable", "outage");
    }
    if (!res.ok) {
      throw new AniListError(`AniList request failed (${res.status})`, "network");
    }

    let json: { errors?: { message: string }[]; data?: T | null };
    try {
      json = (await res.json()) as { errors?: { message: string }[]; data?: T | null };
    } catch (error) {
      throw toNetworkError(error);
    }
    if (json.errors?.length) {
      throw new AniListError(json.errors[0].message, "graphql");
    }
    if (json.data == null) {
      throw new AniListError("AniList returned an empty response", "outage");
    }
    return json.data;
  };

  return attempt(retries);
}
