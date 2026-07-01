"use server";

import { LISTING_PAGE_SIZE } from "@/lib/anilist/domain/listing";
import { AniListError } from "@/lib/anilist/domain/errors";
import type { MediaCardTooltip, MediaPageResult } from "@/lib/anilist/domain/types";
import type { AnimeSeason } from "@/lib/anilist/domain/season";
import type { MediaPageQueryVariables } from "@/lib/anilist/generated/graphql";
import type { AnimeListParams } from "@/lib/browse/params/types";
import { paramsToMediaQuery } from "@/lib/browse/params";
import { getCachedMediaCardTooltip } from "@/lib/anilist/server/get-cached-media-card-tooltip";
import { getCachedMediaPage } from "@/lib/anilist/server/get-media-page";

export type MediaPageActionResult =
  | { ok: true; data: MediaPageResult }
  | { ok: false; code: "rate_limit"; message: string }
  | { ok: false; code: "error"; message: string };

export type TooltipActionResult =
  | { ok: true; data: MediaCardTooltip | null }
  | { ok: false; code: "rate_limit"; message: string }
  | { ok: false; code: "error"; message: string };

function toActionError(error: unknown): Extract<MediaPageActionResult, { ok: false }> {
  if (error instanceof AniListError && error.code === "rate_limit") {
    return { ok: false, code: "rate_limit", message: error.message };
  }

  const message = error instanceof Error ? error.message : "Request failed";
  return { ok: false, code: "error", message };
}

/** Browse infinite scroll — hits the same `"use cache"` layer as SSR. */
export async function loadMediaPage(
  params: AnimeListParams,
  page: number,
  currentSeason: AnimeSeason,
  nextSeason: AnimeSeason,
): Promise<MediaPageActionResult> {
  try {
    const filter = paramsToMediaQuery(params, currentSeason, nextSeason);
    const variables = {
      ...filter,
      page,
      perPage: LISTING_PAGE_SIZE,
    } as MediaPageQueryVariables;

    const data = await getCachedMediaPage(variables);
    return { ok: true, data };
  } catch (error) {
    return toActionError(error);
  }
}

/** Card hover tooltip — hits the same `"use cache"` layer as the former route handler. */
export async function getMediaCardTooltipAction(mediaId: number): Promise<TooltipActionResult> {
  try {
    const data = await getCachedMediaCardTooltip(mediaId);
    return { ok: true, data };
  } catch (error) {
    return toActionError(error);
  }
}
