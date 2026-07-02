import "server-only";

import { connection } from "next/server";
import { getWeekDateKeys, toLocalDateKeyFromDate } from "@/lib/anilist/display/datetime";
import { anilist } from "@/lib/anilist/server/cache/registry";
import type { AiringScheduleItem } from "@/lib/anilist/domain/types";

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
  const priorityPromise = anilist.airingSchedulesForDay(priorityDateKey);

  const dayPromises = Object.fromEntries(
    dateKeys.map((dateKey) => [
      dateKey,
      dateKey === priorityDateKey
        ? priorityPromise
        : priorityPromise.then(() => anilist.airingSchedulesForDay(dateKey)),
    ]),
  ) as AiringDayPromises;

  return { dateKeys, dayPromises };
}
