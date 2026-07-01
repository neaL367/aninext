import "server-only";

import { cache } from "react";
import { connection } from "next/server";
import {
  getWeekCacheKey,
  getWeekDateKeys,
  getWeekRangeFromDateKeys,
  groupByLocalDate,
} from "@/lib/anilist/display/datetime";
import { getCachedAiringSchedulesForWeek } from "@/lib/anilist/server/get-cached-airing-schedules";
import type { AiringScheduleItem } from "@/lib/anilist/domain/types";

/** One in-flight week fetch per request; days slice from the grouped result. */
const getAiringSchedulesGroupedByDay = cache(
  async (weekKey: string, dateKeys: readonly string[]) => {
    const { start, end } = getWeekRangeFromDateKeys(dateKeys);
    const items = await getCachedAiringSchedulesForWeek(weekKey, start, end);
    return groupByLocalDate(items);
  },
);

export type AiringDayPromises = Record<string, Promise<AiringScheduleItem[]>>;

/** Kick off one weekly fetch; each day promise resolves from the shared result. */
export async function getAiringDayPromisesForRequest(): Promise<{
  dateKeys: string[];
  dayPromises: AiringDayPromises;
}> {
  await connection();
  const dateKeys = getWeekDateKeys();
  const weekKey = getWeekCacheKey(dateKeys);
  const groupedPromise = getAiringSchedulesGroupedByDay(weekKey, dateKeys);

  const dayPromises = Object.fromEntries(
    dateKeys.map((dateKey) => [
      dateKey,
      groupedPromise.then((grouped) => grouped.get(dateKey) ?? []),
    ]),
  ) as AiringDayPromises;

  return { dateKeys, dayPromises };
}
