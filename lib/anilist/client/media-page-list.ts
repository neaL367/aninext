import { LISTING_PAGE_SIZE, TOP_100_LIMIT } from "@/lib/anilist/domain/listing";
import type { MediaCard, MediaPageResult } from "@/lib/anilist/domain/types";
import { normalizeListedMedia } from "@/lib/anilist/domain/normalize-media-list";
import type { AnimeListParams } from "@/lib/browse/params/types";
import { getListingMaxPage, paramsToMediaQuery } from "@/lib/browse/params";
import type { AnimeSeason } from "@/lib/anilist/domain/season";

/** Stable key for comparing browse filter sets (SSR, client refetch, stale guards). */
export function serializeBrowseFilterKey(
  params: AnimeListParams,
  currentSeason: AnimeSeason,
  nextSeason: AnimeSeason,
): string {
  const filter = paramsToMediaQuery(params, currentSeason, nextSeason);
  return JSON.stringify(filter, Object.keys(filter).sort());
}

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

/** Next page number to fetch, or null when the list is complete. */
export function getNextPageNumber(
  pages: MediaPageResult[],
  params: AnimeListParams,
): number | null {
  if (pages.length === 0) {
    return null;
  }

  const lastPage = pages.at(-1)!;
  const lastPageNumber = pages.length;
  const maxPage = getListingMaxPage(params.sort);
  const rankTop100 = params.sort === "top-100";
  const loadedCount = pages.flatMap((page) => page.media).length;

  if (rankTop100) {
    if (loadedCount >= TOP_100_LIMIT) {
      return null;
    }
    if (maxPage !== null && lastPageNumber >= maxPage) {
      return null;
    }
  }

  if (!lastPage.pageInfo.hasNextPage) {
    return null;
  }

  return lastPageNumber + 1;
}

export function canLoadMorePages(
  pages: MediaPageResult[],
  params: AnimeListParams,
  mediaCount: number,
): boolean {
  const maxPage = getListingMaxPage(params.sort);
  const hasNextPage = getNextPageNumber(pages, params) !== null;

  if (!hasNextPage) {
    return false;
  }

  if (maxPage === null) {
    return true;
  }

  return mediaCount < maxPage * LISTING_PAGE_SIZE;
}
