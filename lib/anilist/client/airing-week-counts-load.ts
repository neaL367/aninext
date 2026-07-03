"use client";

import { loadAiringWeekCounts } from "@/lib/anilist/server/actions";

let inflight: Promise<Record<string, number>> | null = null;

/** Client dedupe for the full week count batch — one server action per page visit. */
export function loadAiringWeekCountsClient(
  dateKeys: readonly string[],
): Promise<Record<string, number>> {
  if (inflight) {
    return inflight;
  }

  inflight = loadAiringWeekCounts(dateKeys).then((result) => {
    inflight = null;
    if (!result.ok) {
      throw new Error(result.message);
    }
    return result.data;
  });

  void inflight.catch(() => {
    inflight = null;
  });

  return inflight;
}
