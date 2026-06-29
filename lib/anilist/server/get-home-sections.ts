import { cache } from "react";
import { CAROUSEL_PER_PAGE } from "@/lib/anilist/constants";
import { HomeSectionsDocument } from "@/lib/anilist/generated/graphql";
import { executeGraphQL } from "@/lib/anilist/graphql-client";
import type {
  HomeSectionId,
  HomeSectionsData,
} from "@/lib/anilist/home-sections";
import type { MediaCard } from "@/lib/anilist/types";
import { applyPopularityPercents } from "@/lib/anilist/utils/format";
import { withTop100Ranks } from "@/lib/anilist/utils/rank";
import {
  getCurrentAnimeSeason,
  getNextAnimeSeason,
} from "@/lib/anilist/utils/season";

function normalizeHomeSectionMedia(
  media: Array<MediaCard | null> | null | undefined
): MediaCard[] {
  return (media ?? []).filter((item): item is MediaCard => item !== null);
}

/** One batched AniList request for all home carousel sections (per request). */
export const getHomeSections = cache(async (): Promise<HomeSectionsData> => {
  const current = getCurrentAnimeSeason();
  const next = getNextAnimeSeason();

  const data = await executeGraphQL(HomeSectionsDocument, {
    perPage: CAROUSEL_PER_PAGE,
    currentSeason: current.season,
    currentSeasonYear: current.year,
    nextSeason: next.season,
    nextSeasonYear: next.year,
  });

  const trending = applyPopularityPercents(
    normalizeHomeSectionMedia(data.trending?.media)
  );
  const airingNow = applyPopularityPercents(
    normalizeHomeSectionMedia(data.airingNow?.media)
  );
  const popularThisSeason = applyPopularityPercents(
    normalizeHomeSectionMedia(data.popularThisSeason?.media)
  );
  const upcomingNextSeason = applyPopularityPercents(
    normalizeHomeSectionMedia(data.upcomingNextSeason?.media)
  );
  const allTimePopular = applyPopularityPercents(
    normalizeHomeSectionMedia(data.allTimePopular?.media)
  );
  const top100 = withTop100Ranks(
    applyPopularityPercents(normalizeHomeSectionMedia(data.top100?.media))
  ).slice(0, CAROUSEL_PER_PAGE);

  return {
    trending,
    airingNow,
    popularThisSeason,
    upcomingNextSeason,
    allTimePopular,
    top100,
  };
});

export async function getHomeSectionMedia(
  section: HomeSectionId
): Promise<MediaCard[]> {
  const sections = await getHomeSections();
  return sections[section];
}
