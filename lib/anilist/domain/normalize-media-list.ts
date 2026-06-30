import {
  CAROUSEL_PER_PAGE,
  TOP_100_LIMIT,
} from "@/lib/anilist/domain/listing";
import type { MediaCard } from "@/lib/anilist/domain/types";
import { applyPopularityPercents } from "@/lib/anilist/display/format";
import { withTop100Ranks } from "@/lib/anilist/domain/rank";

export type ListedMediaRankMode = "top100";

export type NormalizeListedMediaOptions = {
  rankMode?: ListedMediaRankMode;
  limit?: number;
};

export function filterNonNullMedia(
  media: Array<MediaCard | null> | null | undefined
): MediaCard[] {
  return (media ?? []).filter((item): item is MediaCard => item !== null);
}

function dedupeMediaById(media: MediaCard[]): MediaCard[] {
  const seen = new Set<number>();

  return media.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }

    seen.add(item.id);
    return true;
  });
}

/** Shared list post-processing for home carousels and browse infinite scroll. */
export function normalizeListedMedia(
  media: Array<MediaCard | null> | null | undefined,
  options: NormalizeListedMediaOptions = {}
): MediaCard[] {
  let result = applyPopularityPercents(
    dedupeMediaById(filterNonNullMedia(media))
  );

  if (options.rankMode === "top100") {
    const limit = options.limit ?? TOP_100_LIMIT;
    result = withTop100Ranks(result).slice(0, limit);
  }

  return result;
}

/** Home carousel top-100 slice uses carousel page size. */
export function normalizeHomeTop100Media(
  media: Array<MediaCard | null> | null | undefined
): MediaCard[] {
  return normalizeListedMedia(media, {
    rankMode: "top100",
    limit: CAROUSEL_PER_PAGE,
  });
}
