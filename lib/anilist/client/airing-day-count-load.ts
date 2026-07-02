"use client";

import { loadAiringDayCount } from "@/lib/anilist/server/actions";

const inflight = new Map<string, Promise<number>>();
let chain: Promise<unknown> = Promise.resolve();

/** Client dedupe + serialized background count loads (same L2 as server fetcher). */
export function loadAiringDayCountClient(dateKey: string): Promise<number> {
  const pending = inflight.get(dateKey);
  if (pending) {
    return pending;
  }

  const promise = chain
    .then(() => loadAiringDayCount(dateKey))
    .then((result) => {
      if (!result.ok) {
        inflight.delete(dateKey);
        throw new Error(result.message);
      }
      return result.data;
    });

  inflight.set(dateKey, promise);
  chain = promise.then(
    () => undefined,
    () => undefined,
  );

  return promise;
}
