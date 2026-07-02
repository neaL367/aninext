import { CAROUSEL_PER_PAGE } from "@/lib/anilist/domain/listing";
import type { HomePageSectionsQueryVariables } from "@/lib/anilist/generated/graphql";
import type { HomeSectionId } from "@/lib/anilist/domain/home-sections";
import type { AnimeSeason } from "@/lib/anilist/domain/season";
import { DEFAULT_ANIME_LIST_PARAMS, type AnimeListParams } from "@/lib/browse/params";

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

/** Variables for the batched home page query (one HTTP request for all carousels). */
export function buildHomePageSectionVariables(
  current: AnimeSeason,
  next: AnimeSeason,
): HomePageSectionsQueryVariables {
  return {
    perPage: CAROUSEL_PER_PAGE,
    currentSeason: current.season,
    currentSeasonYear: current.year,
    nextSeason: next.season,
    nextSeasonYear: next.year,
  };
}
