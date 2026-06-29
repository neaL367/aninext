import { cache } from "react";
import { connection } from "next/server";
import { getWeekRange } from "@/lib/anilist/utils/season";
import { getCachedAiringSchedules } from "@/lib/anilist/server/get-cached-airing-schedules";
import type { AiringScheduleItem } from "@/lib/anilist/types";

export const getAiringSchedules = cache(
  async (start: number, end: number): Promise<AiringScheduleItem[]> => {
    return getCachedAiringSchedules(start, end);
  }
);

/** One in-flight airing week fetch per request (cached across refreshes). */
export const getAiringSchedulesForRequest = cache(
  async (): Promise<AiringScheduleItem[]> => {
    await connection();
    const { start, end } = getWeekRange();
    return getCachedAiringSchedules(start, end);
  }
);
