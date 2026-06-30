import "server-only";

import { cache } from "react";
import { connection } from "next/server";
import { getCachedAiringSchedulesForDay } from "@/lib/anilist/server/get-cached-airing-schedules";
import {
  getDayRangeFromDateKey,
  getWeekDateKeys,
} from "@/lib/anilist/utils/datetime";
import type { AiringScheduleItem } from "@/lib/anilist/types";

/** One in-flight airing day fetch per request (deduped by date key). */
export const getAiringSchedulesForDay = cache(
  async (dateKey: string): Promise<AiringScheduleItem[]> => {
    const { start, end } = getDayRangeFromDateKey(dateKey);
    return getCachedAiringSchedulesForDay(dateKey, start, end);
  }
);

export type AiringDayPromises = Record<string, Promise<AiringScheduleItem[]>>;

/** Kick off parallel per-day fetches; each day resolves independently for streaming. */
export async function getAiringDayPromisesForRequest(): Promise<{
  dateKeys: string[];
  dayPromises: AiringDayPromises;
}> {
  await connection();
  const dateKeys = getWeekDateKeys();
  const dayPromises = Object.fromEntries(
    dateKeys.map((dateKey) => [dateKey, getAiringSchedulesForDay(dateKey)])
  ) as AiringDayPromises;

  return { dateKeys, dayPromises };
}
