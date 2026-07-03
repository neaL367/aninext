"use server";

import { chunkTooltipBatchIds } from "@/lib/anilist/domain/tooltip-batch";
import { LISTING_PAGE_SIZE } from "@/lib/anilist/domain/listing";
import { AniListError } from "@/lib/anilist/domain/errors";
import type {
  AiringScheduleItem,
  MediaCardTooltip,
  MediaPageResult,
} from "@/lib/anilist/domain/types";
import type { AnimeSeason } from "@/lib/anilist/domain/season";
import type { MediaPageQueryVariables } from "@/lib/anilist/generated/graphql";
import type { AnimeListParams } from "@/lib/browse/params/types";
import { paramsToMediaQuery } from "@/lib/browse/params";
import { anilist } from "@/lib/anilist/server/fetchers";
import {
  getAiringScheduleCountForDay,
  getAiringSchedulesForDay,
} from "@/lib/anilist/server/get-airing-schedules";

export type MediaPageActionResult =
  | { ok: true; data: MediaPageResult }
  | { ok: false; code: "rate_limit"; message: string }
  | { ok: false; code: "error"; message: string };

export type TooltipBatchActionResult =
  | { ok: true; data: Record<number, MediaCardTooltip | null> }
  | { ok: false; code: "rate_limit"; message: string }
  | { ok: false; code: "error"; message: string };

export type AiringDayActionResult =
  | { ok: true; data: AiringScheduleItem[] }
  | { ok: false; code: "rate_limit"; message: string }
  | { ok: false; code: "error"; message: string };

function toActionError(error: unknown): Extract<MediaPageActionResult, { ok: false }> {
  if (error instanceof AniListError && error.code === "rate_limit") {
    return { ok: false, code: "rate_limit", message: error.message };
  }

  const message = error instanceof Error ? error.message : "Request failed";
  return { ok: false, code: "error", message };
}

/** Browse infinite scroll — hits the same L2 cache layer as SSR. */
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

    const data = await anilist.mediaPage(variables);
    return { ok: true, data };
  } catch (error) {
    return toActionError(error);
  }
}

/** Batched card hover tooltips — up to 8 IDs per AniList HTTP request. */
export async function getMediaCardTooltipsBatchAction(
  mediaIds: number[],
): Promise<TooltipBatchActionResult> {
  try {
    const merged: Record<number, MediaCardTooltip | null> = {};

    for (const chunk of chunkTooltipBatchIds(mediaIds)) {
      const batch = await anilist.mediaCardTooltipBatch(chunk);
      for (const [mediaId, tooltip] of batch) {
        merged[mediaId] = tooltip;
      }
    }

    return { ok: true, data: merged };
  } catch (error) {
    return toActionError(error);
  }
}

/** Airing weekday tab count — lightweight id-only query; same L2 as `airingScheduleCountForDay`. */
export async function loadAiringDayCount(
  dateKey: string,
): Promise<
  | { ok: true; data: number }
  | { ok: false; code: "rate_limit"; message: string }
  | { ok: false; code: "error"; message: string }
> {
  try {
    const data = await getAiringScheduleCountForDay(dateKey);
    return { ok: true, data };
  } catch (error) {
    return toActionError(error);
  }
}

/** Airing weekday tab — lazy after SSR priority day; same L2 as `airingSchedulesForDay`. */
export async function loadAiringDay(dateKey: string): Promise<AiringDayActionResult> {
  try {
    const data = await getAiringSchedulesForDay(dateKey);
    return { ok: true, data };
  } catch (error) {
    return toActionError(error);
  }
}

export type AiringWeekCountsActionResult =
  | { ok: true; data: Record<string, number> }
  | { ok: false; code: "rate_limit"; message: string }
  | { ok: false; code: "error"; message: string };

/** All weekday tab counts in one server round trip (L2 hits skip AniList). */
export async function loadAiringWeekCounts(
  dateKeys: readonly string[],
): Promise<AiringWeekCountsActionResult> {
  try {
    const entries = await Promise.all(
      dateKeys.map(async (dateKey) => {
        const count = await getAiringScheduleCountForDay(dateKey);
        return [dateKey, count] as const;
      }),
    );
    return { ok: true, data: Object.fromEntries(entries) };
  } catch (error) {
    return toActionError(error);
  }
}
