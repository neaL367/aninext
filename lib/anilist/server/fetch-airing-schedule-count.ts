import { AiringScheduleCountDocument } from "@/lib/anilist/generated/graphql";
import { executeGraphQL } from "@/lib/anilist/infra/graphql-client";

const MAX_AIRING_PAGES = 20;

/** Count airing slots for a day window (id-only query, sequential pages). */
export async function fetchAiringScheduleCount(start: number, end: number): Promise<number> {
  const firstPage = await executeGraphQL(AiringScheduleCountDocument, {
    airingAt_greater: start,
    airingAt_lesser: end,
    page: 1,
  });

  const pageInfo = firstPage.Page?.pageInfo;
  const schedules = firstPage.Page?.airingSchedules ?? [];

  if (!pageInfo) return schedules.length;

  // Calculate total count using lastPage and current page length
  const totalCount = ((pageInfo.lastPage ?? 1) - 1) * 50 + schedules.length;
  return totalCount;
}
