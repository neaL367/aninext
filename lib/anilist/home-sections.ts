import type { MediaCard } from "@/lib/anilist/types";
import {
  getCurrentAnimeSeason,
  getNextAnimeSeason,
} from "@/lib/anilist/utils/season";
import { queryKeys } from "@/lib/anilist/query-keys";

export const HOME_SECTION_IDS = [
  "trending",
  "airingNow",
  "popularThisSeason",
  "upcomingNextSeason",
  "allTimePopular",
  "top100",
] as const;

export type HomeSectionId = (typeof HOME_SECTION_IDS)[number];

export type HomeSectionsData = Record<HomeSectionId, MediaCard[]>;

export function getHomeSectionsQueryKey() {
  const current = getCurrentAnimeSeason();
  const next = getNextAnimeSeason();
  return queryKeys.home.sections(
    current.season,
    current.year,
    next.season,
    next.year
  );
}

export function getHomeSectionQueryKey(section: HomeSectionId) {
  const current = getCurrentAnimeSeason();
  const next = getNextAnimeSeason();

  switch (section) {
    case "trending":
      return queryKeys.home.trending;
    case "airingNow":
      return queryKeys.home.airingNow;
    case "popularThisSeason":
      return queryKeys.home.popularThisSeason(current.season, current.year);
    case "upcomingNextSeason":
      return queryKeys.home.upcomingNextSeason(next.season, next.year);
    case "allTimePopular":
      return queryKeys.home.allTimePopular;
    case "top100":
      return queryKeys.home.top100;
  }
}
