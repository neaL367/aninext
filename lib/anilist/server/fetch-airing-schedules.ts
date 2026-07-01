import { AiringSchedulesDocument } from "@/lib/anilist/generated/graphql";
import { executeGraphQL } from "@/lib/anilist/infra/graphql-client";
import { normalizeAiringSchedules, type AiringScheduleItem } from "@/lib/anilist/domain/types";

const MAX_AIRING_PAGES = 20;

async function fetchAiringPage(start: number, end: number, page: number) {
  return executeGraphQL(AiringSchedulesDocument, {
    airingAt_greater: start,
    airingAt_lesser: end,
    page,
  });
}

/** Fetch every airing schedule page for the week window (AniList caps at 50 per page). */
export async function fetchAllAiringSchedules(
  start: number,
  end: number,
): Promise<AiringScheduleItem[]> {
  const byId = new Map<number, AiringScheduleItem>();

  const firstPage = await fetchAiringPage(start, end, 1);
  for (const item of normalizeAiringSchedules(firstPage)) {
    byId.set(item.id, item);
  }

  const pageInfo = firstPage.Page?.pageInfo;
  if (!pageInfo?.hasNextPage) {
    return [...byId.values()].sort((a, b) => a.airingAt - b.airingAt);
  }

  const lastPage = Math.min(pageInfo.lastPage ?? 1, MAX_AIRING_PAGES);

  // Paginate sequentially — parallel page fetches per day burst past AniList rate limits.
  for (let page = 2; page <= lastPage; page += 1) {
    const data = await fetchAiringPage(start, end, page);
    for (const item of normalizeAiringSchedules(data)) {
      byId.set(item.id, item);
    }
  }

  return [...byId.values()].sort((a, b) => a.airingAt - b.airingAt);
}
