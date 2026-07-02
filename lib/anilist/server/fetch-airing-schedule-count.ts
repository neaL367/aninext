import { AiringScheduleCountDocument } from "@/lib/anilist/generated/graphql";
import { executeGraphQL } from "@/lib/anilist/infra/graphql-client";

const MAX_AIRING_PAGES = 20;

/** Count airing slots for a day window (id-only query, sequential pages). */
export async function fetchAiringScheduleCount(start: number, end: number): Promise<number> {
  let count = 0;

  const firstPage = await executeGraphQL(AiringScheduleCountDocument, {
    airingAt_greater: start,
    airingAt_lesser: end,
    page: 1,
  });

  count += firstPage.Page?.airingSchedules?.length ?? 0;

  const pageInfo = firstPage.Page?.pageInfo;
  if (!pageInfo?.hasNextPage) {
    return count;
  }

  const lastPage = Math.min(pageInfo.lastPage ?? 1, MAX_AIRING_PAGES);

  for (let page = 2; page <= lastPage; page += 1) {
    const data = await executeGraphQL(AiringScheduleCountDocument, {
      airingAt_greater: start,
      airingAt_lesser: end,
      page,
    });
    count += data.Page?.airingSchedules?.length ?? 0;
  }

  return count;
}
