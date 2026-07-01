import { LISTING_PAGE_SIZE, TOP_100_LIMIT } from "@/lib/anilist/domain/listing";
import type { MediaCard, MediaPageResult } from "@/lib/anilist/domain/types";
import { normalizeListedMedia } from "@/lib/anilist/domain/normalize-media-list";
import { anilistQueryGcTime, anilistQueryStaleTime } from "@/lib/anilist/client/query-policy";
import type { AnimeListParams } from "@/lib/browse/params";
import { getListingMaxPage, paramsToMediaQuery } from "@/lib/browse/params";
import type { AnimeSeason } from "@/lib/anilist/domain/season";

/** Merge paginated browse results without re-normalizing earlier pages on each append. */
export function mergeInfiniteMediaPages(
  pages: MediaPageResult[],
  rankTop100: boolean,
): MediaCard[] {
  if (rankTop100) {
    return normalizeListedMedia(
      pages.flatMap((page) => page.media),
      { rankMode: "top100" },
    );
  }

  const seen = new Set<number>();
  const media: MediaCard[] = [];

  for (const page of pages) {
    for (const item of page.media) {
      if (seen.has(item.id)) {
        continue;
      }

      seen.add(item.id);
      media.push(item);
    }
  }

  return media;
}

export function buildMediaPageInfiniteConfig(
  params: AnimeListParams,
  currentSeason: AnimeSeason,
  nextSeason: AnimeSeason,
) {
  const filter = paramsToMediaQuery(params, currentSeason, nextSeason);
  const maxPage = getListingMaxPage(params.sort);
  const rankTop100 = params.sort === "top-100";

  return {
    queryKey: ["anilist", "media", "infinite", filter] as const,
    filter,
    maxPage,
    initialPageParam: 1 as const,
    staleTime: anilistQueryStaleTime.mediaPage,
    gcTime: anilistQueryGcTime.mediaPage,
    refetchOnMount: false as const,
    refetchOnWindowFocus: false as const,
    getNextPageParam: (
      lastPage: MediaPageResult,
      allPages: MediaPageResult[],
      lastPageParam: number,
    ) => {
      const loadedCount = allPages.flatMap((page) => page.media).length;

      if (rankTop100) {
        if (loadedCount >= TOP_100_LIMIT) {
          return undefined;
        }
        if (maxPage !== null && lastPageParam >= maxPage) {
          return undefined;
        }
      }

      if (!lastPage.pageInfo.hasNextPage) {
        return undefined;
      }

      return lastPageParam + 1;
    },
    select: (data: { pages: MediaPageResult[] }) => ({
      pages: data.pages,
      media: mergeInfiniteMediaPages(data.pages, rankTop100),
    }),
    perPage: LISTING_PAGE_SIZE,
  };
}
