import { CAROUSEL_PER_PAGE, TOP_100_LIMIT } from "@/lib/anilist/constants";
import type { MediaCard } from "@/lib/anilist/types";
import type { AnimeSort } from "@/lib/routes/search-params";
import { applyPopularityPercents } from "@/lib/anilist/utils/format";
import { withTop100Ranks } from "@/lib/anilist/utils/rank";

export function filterNonNullMedia(
  media: Array<MediaCard | null> | null | undefined
): MediaCard[] {
  return (media ?? []).filter((item): item is MediaCard => item !== null);
}

/** Shared list post-processing for home carousels and browse infinite scroll. */
export function normalizeListedMedia(
  media: Array<MediaCard | null> | null | undefined,
  options: { sort?: AnimeSort | "top100"; limit?: number } = {}
): MediaCard[] {
  let result = applyPopularityPercents(filterNonNullMedia(media));

  const isTop100 =
    options.sort === "top-100" || options.sort === "top100";

  if (isTop100) {
    const limit =
      options.limit ??
      (options.sort === "top100" ? CAROUSEL_PER_PAGE : TOP_100_LIMIT);
    result = withTop100Ranks(result).slice(0, limit);
  }

  return result;
}
