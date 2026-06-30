import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";
import {
  HomeSectionMediaDocument,
} from "@/lib/anilist/generated/graphql";
import type { HomeSectionId } from "@/lib/anilist/domain/home-sections";
import { executeGraphQL } from "@/lib/anilist/infra/graphql-client";
import { anilistCacheLife } from "@/lib/anilist/server/cache-policy";
import { anilistCacheTags } from "@/lib/anilist/server/cache-tags";
import type { MediaCard } from "@/lib/anilist/domain/types";
import { buildHomeSectionVariables } from "@/lib/browse/anilist-queries";
import { normalizeHomeTop100Media, normalizeListedMedia } from "@/lib/anilist/domain/normalize-media-list";
import { sortMediaByNextAiring } from "@/lib/anilist/domain/sort-media-by-airing";
import {
  getCurrentAnimeSeason,
  getNextAnimeSeason,
  type AnimeSeason,
} from "@/lib/anilist/domain/season";

/** Per-section cache so parallel home slots can stream independently. */
async function getCachedHomeSectionMedia(
  section: HomeSectionId,
  current: AnimeSeason,
  next: AnimeSeason
): Promise<MediaCard[]> {
  "use cache";

  cacheLife(anilistCacheLife.homeSection);
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

  const media =
    section === "top100"
      ? normalizeHomeTop100Media(data.Page?.media)
      : normalizeListedMedia(data.Page?.media);

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

/** Build-time home section fetch (no `connection()` — safe for `generateStaticParams`). */
export async function getHomeSectionMediaForStaticGeneration(
  section: HomeSectionId
): Promise<MediaCard[]> {
  const current = getCurrentAnimeSeason();
  const next = getNextAnimeSeason();
  return getCachedHomeSectionMedia(section, current, next);
}
