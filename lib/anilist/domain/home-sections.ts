export const HOME_SECTION_IDS = [
  "trending",
  "airingNow",
  "popularThisSeason",
  "upcomingNextSeason",
  "allTimePopular",
  "top100",
] as const;

export type HomeSectionId = (typeof HOME_SECTION_IDS)[number];
