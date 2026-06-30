import { MAX_CONCURRENT_GRAPHQL_REQUESTS } from "./constants";

let active = 0;
const waiting: Array<() => void> = [];

async function acquire(): Promise<void> {
  if (active < MAX_CONCURRENT_GRAPHQL_REQUESTS) {
    active++;
    return;
  }

  await new Promise<void>((resolve) => {
    waiting.push(() => {
      active++;
      resolve();
    });
  });
}

function release(): void {
  active--;
  const next = waiting.shift();
  if (next) {
    next();
  }
}

/** Limits in-flight AniList HTTP requests to avoid Node gzip listener warnings. */
export async function withConcurrencyLimit<T>(fn: () => Promise<T>): Promise<T> {
  await acquire();
  try {
    return await fn();
  } finally {
    release();
  }
}
