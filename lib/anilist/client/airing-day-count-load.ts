"use client";

import { loadAiringDayCount } from "@/lib/anilist/server/actions";

const inflight = new Map<string, Promise<number>>();

/** Client dedupe for a single weekday count (prefer `loadAiringWeekCountsClient` on /airing). */
export function loadAiringDayCountClient(dateKey: string): Promise<number> {
  const pending = inflight.get(dateKey);
  if (pending) {
    return pending;
  }

  const promise = loadAiringDayCount(dateKey).then((result) => {
    if (!result.ok) {
      inflight.delete(dateKey);
      throw new Error(result.message);
    }
    return result.data;
  });

  inflight.set(dateKey, promise);
  return promise;
}
