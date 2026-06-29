import { AiringSchedulesDocument } from "@/lib/anilist/generated/graphql";
import { executeGraphQL } from "@/lib/anilist/graphql-client";
import {
  normalizeAiringSchedules,
  type AiringScheduleItem,
} from "@/lib/anilist/types";

const MAX_AIRING_PAGES = 20;

/** Fetch every airing schedule page for the week window (AniList caps at 50 per page). */
export async function fetchAllAiringSchedules(
  start: number,
  end: number
): Promise<AiringScheduleItem[]> {
  const byId = new Map<number, AiringScheduleItem>();
  let page = 1;
  let lastPage = 1;

  while (page <= lastPage && page <= MAX_AIRING_PAGES) {
    const data = await executeGraphQL(AiringSchedulesDocument, {
      airingAt_greater: start,
      airingAt_lesser: end,
      page,
    });

    for (const item of normalizeAiringSchedules(data)) {
      byId.set(item.id, item);
    }

    const pageInfo = data.Page?.pageInfo;
    if (!pageInfo?.hasNextPage) {
      break;
    }

    lastPage = pageInfo.lastPage ?? page;
    page += 1;
  }

  return [...byId.values()].sort((a, b) => a.airingAt - b.airingAt);
}
