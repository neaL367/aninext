import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";
import { CAROUSEL_PER_PAGE } from "@/lib/anilist/constants";
import {
  HomeSectionMediaDocument,
  type HomeSectionMediaQueryVariables,
  type MediaSort,
  type MediaStatus,
} from "@/lib/anilist/generated/graphql";
import { executeGraphQL } from "@/lib/anilist/graphql-client";
import { anilistCacheTags } from "@/lib/anilist/server/cache-tags";
import type { MediaCard } from "@/lib/anilist/types";
import { applyPopularityPercents } from "@/lib/anilist/utils/format";
import { withTop100Ranks } from "@/lib/anilist/utils/rank";
import {
  getCurrentAnimeSeason,
  getNextAnimeSeason,
  type AnimeSeason,
} from "@/lib/anilist/utils/season";

export const HOME_SECTION_IDS = [
  "trending",
  "airingNow",
  "popularThisSeason",
  "upcomingNextSeason",
  "allTimePopular",
  "top100",
] as const;

export type HomeSectionId = (typeof HOME_SECTION_IDS)[number];

function normalizeHomeSectionMedia(
  media: Array<MediaCard | null> | null | undefined
): MediaCard[] {
  return (media ?? []).filter((item): item is MediaCard => item !== null);
}

function getHomeSectionVariables(
  section: HomeSectionId,
  current: AnimeSeason,
  next: AnimeSeason
): HomeSectionMediaQueryVariables {
  const perPage = CAROUSEL_PER_PAGE;

  switch (section) {
    case "trending":
      return { perPage, sort: ["TRENDING_DESC"] as MediaSort[] };
    case "airingNow":
      return {
        perPage,
        sort: ["POPULARITY_DESC"] as MediaSort[],
        status: "RELEASING" as MediaStatus,
      };
    case "popularThisSeason":
      return {
        perPage,
        sort: ["POPULARITY_DESC"] as MediaSort[],
        season: current.season,
        seasonYear: current.year,
      };
    case "upcomingNextSeason":
      return {
        perPage,
        sort: ["POPULARITY_DESC"] as MediaSort[],
        season: next.season,
        seasonYear: next.year,
        status_in: ["NOT_YET_RELEASED"] as MediaStatus[],
      };
    case "allTimePopular":
      return { perPage, sort: ["POPULARITY_DESC"] as MediaSort[] };
    case "top100":
      return { perPage, sort: ["SCORE_DESC"] as MediaSort[] };
  }
}

/** Per-section cache so parallel home slots can stream independently. */
async function getCachedHomeSectionMedia(
  section: HomeSectionId,
  current: AnimeSeason,
  next: AnimeSeason
): Promise<MediaCard[]> {
  "use cache";

  cacheLife("hours");
  cacheTag(
    anilistCacheTags.homeSection(
      section,
      current.season,
      current.year,
      next.season,
      next.year
    )
  );

  const data = await executeGraphQL(
    HomeSectionMediaDocument,
    getHomeSectionVariables(section, current, next)
  );

  let media = applyPopularityPercents(
    normalizeHomeSectionMedia(data.Page?.media)
  );

  if (section === "top100") {
    media = withTop100Ranks(media).slice(0, CAROUSEL_PER_PAGE);
  }

  return media;
}

export async function getHomeSectionMedia(
  section: HomeSectionId
): Promise<MediaCard[]> {
  await connection();
  const current = getCurrentAnimeSeason();
  const next = getNextAnimeSeason();
  return getCachedHomeSectionMedia(section, current, next);
}
