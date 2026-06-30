import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { fetchAllAiringSchedules } from "@/lib/anilist/fetch-airing-schedules";
import { anilistCacheTags } from "@/lib/anilist/server/cache-tags";
import type { AiringScheduleItem } from "@/lib/anilist/types";

/** Cross-request cached airing week — short TTL for schedule freshness. */
export async function getCachedAiringSchedules(
  start: number,
  end: number
): Promise<AiringScheduleItem[]> {
  "use cache";

  cacheLife("minutes");
  cacheTag(anilistCacheTags.airing);
  cacheTag(anilistCacheTags.airingRange(start, end));

  return fetchAllAiringSchedules(start, end);
}

/** Cross-request cached single-day airing slice. */
export async function getCachedAiringSchedulesForDay(
  dateKey: string,
  start: number,
  end: number
): Promise<AiringScheduleItem[]> {
  "use cache";

  cacheLife("minutes");
  cacheTag(anilistCacheTags.airing);
  cacheTag(anilistCacheTags.airingDay(dateKey));
  cacheTag(anilistCacheTags.airingRange(start, end));

  return fetchAllAiringSchedules(start, end);
}
