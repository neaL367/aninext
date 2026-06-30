import { LISTING_PAGE_SIZE, TOP_100_LIMIT } from "@/lib/anilist/infra/constants";
import type { MediaPageResult } from "@/lib/anilist/domain/types";
import { normalizeListedMedia } from "@/lib/anilist/domain/normalize-media-list";
import type { AnimeListParams } from "@/lib/browse/params";
import {
  getListingMaxPage,
  paramsToMediaQuery,
} from "@/lib/browse/params";
import type { AnimeSeason } from "@/lib/anilist/display/season";

export function buildMediaPageInfiniteConfig(
  params: AnimeListParams,
  currentSeason: AnimeSeason,
  nextSeason: AnimeSeason
) {
  const filter = paramsToMediaQuery(params, currentSeason, nextSeason);
  const maxPage = getListingMaxPage(params.sort);

  return {
    queryKey: ["anilist", "media", "infinite", filter] as const,
    filter,
    maxPage,
    initialPageParam: 1 as const,
    staleTime: 300_000,
    refetchOnMount: false as const,
    refetchOnWindowFocus: false as const,
    getNextPageParam: (
      lastPage: MediaPageResult,
      allPages: MediaPageResult[],
      lastPageParam: number
    ) => {
      const loadedCount = allPages.flatMap((page) => page.media).length;

      if (params.sort === "top-100") {
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
    select: (data: { pages: MediaPageResult[] }) => {
      const media = normalizeListedMedia(
        data.pages.flatMap((page) => page.media),
        { sort: params.sort }
      );

      return { pages: data.pages, media };
    },
    perPage: LISTING_PAGE_SIZE,
  };
}
