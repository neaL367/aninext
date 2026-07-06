import "server-only";

import { connection } from "next/server";
import { getWeekDateKeys, toLocalDateKeyFromDate } from "@/lib/anilist/display/datetime";
import { anilist } from "@/lib/anilist/server/fetchers";
import type { AiringScheduleItem } from "@/lib/anilist/domain/types";

/**
 * SSR: load today's schedule only. Weekday tab counts load on the client after
 * paint via `loadAiringDayCount` so the route does not block on six extra queries.
 */
export async function getAiringScheduleBootstrap(): Promise<{
  dateKeys: string[];
  priorityDateKey: string;
  initialDayPromise: Promise<AiringScheduleItem[]>;
}> {
  await connection();
  const dateKeys = getWeekDateKeys();
  const todayKey = toLocalDateKeyFromDate(new Date());
  const priorityDateKey = dateKeys.includes(todayKey) ? todayKey : dateKeys[0]!;

  return {
    dateKeys,
    priorityDateKey,
    initialDayPromise: anilist.airingSchedulesForDay(priorityDateKey),
  };
}
