import type { MediaPageQueryVariables } from "./generated/graphql";
import type { paramsToMediaFilter } from "@/lib/routes/search-params";

type MediaFilterVariables = ReturnType<typeof paramsToMediaFilter>;

export const queryKeys = {
  media: {
    list: (variables: MediaPageQueryVariables) =>
      ["anilist", "media", "list", variables] as const,
    infiniteList: (variables: MediaFilterVariables) =>
      ["anilist", "media", "infinite", variables] as const,
    detail: (id: number) => ["anilist", "media", "detail", id] as const,
  },
  airing: {
    range: (start: number, end: number) =>
      ["anilist", "airing", start, end] as const,
  },
  home: {
    sections: (
      currentSeason: string,
      currentYear: number,
      nextSeason: string,
      nextYear: number
    ) =>
      [
        "anilist",
        "home",
        "sections",
        currentSeason,
        currentYear,
        nextSeason,
        nextYear,
      ] as const,
    trending: ["anilist", "home", "trending"] as const,
    airingNow: ["anilist", "home", "airing-now"] as const,
    popularThisSeason: (season: string, year: number) =>
      ["anilist", "home", "popular", season, year] as const,
    upcomingNextSeason: (season: string, year: number) =>
      ["anilist", "home", "upcoming", season, year] as const,
    allTimePopular: ["anilist", "home", "all-time-popular"] as const,
    top100: ["anilist", "home", "top-100"] as const,
  },
  genres: ["anilist", "genres"] as const,
} as const;
