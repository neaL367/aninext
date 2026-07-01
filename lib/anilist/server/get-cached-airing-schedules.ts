import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { fetchAllAiringSchedules } from "@/lib/anilist/server/fetch-airing-schedules";
import { anilistCacheLife } from "@/lib/anilist/server/cache-policy";
import { anilistCacheTags } from "@/lib/anilist/server/cache-tags";
import type { AiringScheduleItem } from "@/lib/anilist/domain/types";

/** Cross-request cached single-day airing slice. */
export async function getCachedAiringSchedulesForDay(
  dateKey: string,
  start: number,
  end: number,
): Promise<AiringScheduleItem[]> {
  "use cache";

  cacheLife(anilistCacheLife.airingSchedules);
  cacheTag(anilistCacheTags.airing);
  cacheTag(anilistCacheTags.airingDay(dateKey));
  cacheTag(anilistCacheTags.airingRange(start, end));

  return fetchAllAiringSchedules(start, end);
}
