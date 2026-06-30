import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";
import {
  HomeSectionMediaDocument,
} from "@/lib/anilist/generated/graphql";
import { executeGraphQL } from "@/lib/anilist/infra/graphql-client";
import { anilistCacheTags } from "@/lib/anilist/server/cache-tags";
import type { MediaCard } from "@/lib/anilist/domain/types";
import { buildHomeSectionVariables } from "@/lib/browse/anilist-queries";
import { normalizeListedMedia } from "@/lib/anilist/domain/normalize-media-list";
import { sortMediaByNextAiring } from "@/lib/anilist/domain/sort-media-by-airing";
import {
  getCurrentAnimeSeason,
  getNextAnimeSeason,
  type AnimeSeason,
} from "@/lib/anilist/display/season";

export const HOME_SECTION_IDS = [
  "trending",
  "airingNow",
  "popularThisSeason",
  "upcomingNextSeason",
  "allTimePopular",
  "top100",
] as const;

export type HomeSectionId = (typeof HOME_SECTION_IDS)[number];

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
    buildHomeSectionVariables(section, current, next)
  );

  const media = normalizeListedMedia(data.Page?.media, {
    sort: section === "top100" ? "top100" : undefined,
  });

  return section === "airingNow" ? sortMediaByNextAiring(media) : media;
}

export async function getHomeSectionMedia(
  section: HomeSectionId
): Promise<MediaCard[]> {
  await connection();
  const current = getCurrentAnimeSeason();
  const next = getNextAnimeSeason();
  return getCachedHomeSectionMedia(section, current, next);
}
