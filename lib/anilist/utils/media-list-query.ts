import { CAROUSEL_PER_PAGE } from "@/lib/anilist/constants";
import type { HomeSectionMediaQueryVariables } from "@/lib/anilist/generated/graphql";
import type { HomeSectionId } from "@/lib/anilist/server/get-home-sections";
import {
  DEFAULT_ANIME_LIST_PARAMS,
  paramsToMediaQuery,
  type AnimeListParams,
} from "@/lib/routes/search-params";
import type { AnimeSeason } from "@/lib/anilist/utils/season";

/** Map home carousel slots to the same browse params used by "View all" links. */
export function homeSectionToListParams(section: HomeSectionId): AnimeListParams {
  switch (section) {
    case "trending":
      return { ...DEFAULT_ANIME_LIST_PARAMS, sort: "trending" };
    case "airingNow":
      return {
        ...DEFAULT_ANIME_LIST_PARAMS,
        sort: "all-time-popular",
        statuses: ["RELEASING"],
      };
    case "popularThisSeason":
      return { ...DEFAULT_ANIME_LIST_PARAMS, sort: "popular-this-season" };
    case "upcomingNextSeason":
      return { ...DEFAULT_ANIME_LIST_PARAMS, sort: "upcoming-next-season" };
    case "allTimePopular":
      return { ...DEFAULT_ANIME_LIST_PARAMS, sort: "all-time-popular" };
    case "top100":
      return { ...DEFAULT_ANIME_LIST_PARAMS, sort: "top-100" };
  }
}

export function buildHomeSectionVariables(
  section: HomeSectionId,
  current: AnimeSeason,
  next: AnimeSeason
): HomeSectionMediaQueryVariables {
  const params = homeSectionToListParams(section);
  const query = paramsToMediaQuery(params, current, next);

  return {
    perPage: CAROUSEL_PER_PAGE,
    ...query,
  };
}
