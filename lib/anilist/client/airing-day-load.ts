"use client";

import { loadAiringDay } from "@/lib/anilist/server/actions";
import type { AiringScheduleItem } from "@/lib/anilist/domain/types";

const inflight = new Map<string, Promise<AiringScheduleItem[]>>();

/** Client dedupe for weekday tab loads — shares L2 with SSR via server action. */
export function loadAiringDayClient(dateKey: string): Promise<AiringScheduleItem[]> {
  const pending = inflight.get(dateKey);
  if (pending) {
    return pending;
  }

  const promise = loadAiringDay(dateKey).then((result) => {
    if (!result.ok) {
      inflight.delete(dateKey);
      throw new Error(result.message);
    }
    return result.data;
  });

  inflight.set(dateKey, promise);
  return promise;
}
