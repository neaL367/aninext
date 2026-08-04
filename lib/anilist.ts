import "server-only";

const ENDPOINT = "https://graphql.anilist.co";

const activeRequests: Promise<unknown>[] = [];
const MAX_CONCURRENT = 4;

export class AniListError extends Error {
  constructor(
    message: string,
    public kind: "rate_limited" | "outage" | "graphql" | "network",
    public retryAfterSeconds?: number
  ) {
    super(message);
  }
}

function wait(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

async function throttle() {
  while (activeRequests.length >= MAX_CONCURRENT) {
    await Promise.race(activeRequests);
  }
}

async function track<T>(p: Promise<T>): Promise<T> {
  activeRequests.push(p);
  try {
    return await p;
  } finally {
    const idx = activeRequests.indexOf(p);
    if (idx !== -1) activeRequests.splice(idx, 1);
  }
}

export async function anilistFetch<T>(
  query: string,
  variables: Record<string, unknown>,
  retries = 2
): Promise<T> {
  await throttle();

  const attempt = async (remaining: number): Promise<T> => {
    const res = await track(
      fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ query, variables }),
      })
    );

    if (res.status === 429) {
      if (remaining <= 0) {
        const retryAfter = Number(
          res.headers.get("Retry-After") ??
            res.headers.get("X-RateLimit-Reset") ??
            30
        );
        throw new AniListError(
          "AniList rate limit hit",
          "rate_limited",
          retryAfter
        );
      }
      const retryAfter = Number(
        res.headers.get("Retry-After") ??
          res.headers.get("X-RateLimit-Reset") ??
          5
      );
      const backoff = Math.min(retryAfter * 1000, 10_000);
      await wait(backoff);
      return attempt(remaining - 1);
    }
    if (res.status === 403) {
      throw new AniListError(
        "AniList API temporarily unavailable",
        "outage"
      );
    }
    if (!res.ok) {
      throw new AniListError(
        `AniList request failed (${res.status})`,
        "network"
      );
    }

    const json = await res.json();
    if (json.errors?.length) {
      throw new AniListError(json.errors[0].message, "graphql");
    }
    return json.data as T;
  };

  return attempt(retries);
}
