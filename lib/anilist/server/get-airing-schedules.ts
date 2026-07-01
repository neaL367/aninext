import "server-only";

import { cache } from "react";
import { connection } from "next/server";
import {
  getDayRangeFromDateKey,
  getWeekDateKeys,
  toLocalDateKeyFromDate,
} from "@/lib/anilist/display/datetime";
import { getCachedAiringSchedulesForDay } from "@/lib/anilist/server/get-cached-airing-schedules";
import type { AiringScheduleItem } from "@/lib/anilist/domain/types";

/** Per-request dedupe for repeated day promises. */
const getAiringSchedulesForDateKey = cache(async (dateKey: string) => {
  const { start, end } = getDayRangeFromDateKey(dateKey);
  return getCachedAiringSchedulesForDay(dateKey, start, end);
});

export type AiringDayPromises = Record<string, Promise<AiringScheduleItem[]>>;

/**
 * Kick off the visible day first. Other weekdays intentionally wait behind it,
 * so the main schedule list can replace the skeleton without waiting for the
 * whole week to paginate through AniList.
 */
export async function getAiringDayPromisesForRequest(): Promise<{
  dateKeys: string[];
  dayPromises: AiringDayPromises;
}> {
  await connection();
  const dateKeys = getWeekDateKeys();
  const todayKey = toLocalDateKeyFromDate(new Date());
  const priorityDateKey = dateKeys.includes(todayKey) ? todayKey : dateKeys[0]!;
  const priorityPromise = getAiringSchedulesForDateKey(priorityDateKey);

  const dayPromises = Object.fromEntries(
    dateKeys.map((dateKey) => [
      dateKey,
      dateKey === priorityDateKey
        ? priorityPromise
        : priorityPromise.then(() => getAiringSchedulesForDateKey(dateKey)),
    ]),
  ) as AiringDayPromises;

  return { dateKeys, dayPromises };
}
