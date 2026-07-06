"use server";

import { fetchAllAiringSchedules } from "@/lib/anilist/server/fetch-airing-schedules";
import { fetchAiringScheduleCount } from "@/lib/anilist/server/fetch-airing-schedule-count";
import { getDayRangeFromDateKey } from "@/lib/anilist/display/datetime";

export async function getAiringSchedulesForDay(dateKey: string) {
  "use cache";
  const { start, end } = getDayRangeFromDateKey(dateKey);
  return fetchAllAiringSchedules(start, end);
}

export async function getAiringScheduleCountForDay(dateKey: string) {
  "use cache";
  const { start, end } = getDayRangeFromDateKey(dateKey);
  return fetchAiringScheduleCount(start, end);
}
