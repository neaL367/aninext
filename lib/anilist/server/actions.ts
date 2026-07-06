"use server";

import { chunkTooltipBatchIds } from "@/lib/anilist/domain/tooltip-batch";
import { LISTING_PAGE_SIZE } from "@/lib/anilist/domain/listing";
import { AniListError } from "@/lib/anilist/domain/errors";
import type {
  AiringScheduleItem,
  MediaCardTooltip,
  MediaPageResult,
  GlobalSearchResult,
} from "@/lib/anilist/domain/types";
import type { 
  GlobalSearchDocument, 
  GlobalSearchQuery 
} from "@/lib/anilist/generated/graphql";
import type { AnimeSeason } from "@/lib/anilist/domain/season";
import type { MediaPageQueryVariables } from "@/lib/anilist/generated/graphql";
import type { AnimeListParams } from "@/lib/browse/params/types";
import { paramsToMediaQuery } from "@/lib/browse/params";

import { getMediaDetail } from "@/lib/anilist/server/dal/media";
import { getMediaPage, getGlobalSearch } from "@/lib/anilist/server/dal/pages";
import { executeGraphQL } from "@/lib/anilist/infra/graphql-client";

import { getMediaCardTooltipBatch } from "@/lib/anilist/server/dal/tooltips";
import { getAiringScheduleCountForDay, getAiringSchedulesForDay } from "@/lib/anilist/server/dal/airing";

export type ActionError = { ok: false; code: "rate_limit" | "circuit_breaker" | "network" | "error"; message: string };
export type ActionResult<T> = { ok: true; data: T } | ActionError;

export type MediaPageActionResult = ActionResult<MediaPageResult>;
export type TooltipBatchActionResult = ActionResult<Record<number, MediaCardTooltip | null>>;
export type AiringDayActionResult = ActionResult<AiringScheduleItem[]>;
export type AiringWeekCountsActionResult = ActionResult<Record<string, number>>;
export type GlobalSearchActionResult = ActionResult<GlobalSearchResult[]>;

function toActionError(error: unknown): ActionError {
  if (error instanceof AniListError) {
    if (error.code === "rate_limit") {
      return { ok: false, code: "rate_limit", message: error.message };
    }
    if (error.code === "circuit_breaker") {
      return { ok: false, code: "circuit_breaker", message: error.message };
    }
    if (error.code === "network") {
      return { ok: false, code: "network", message: error.message };
    }
  }
  const message = error instanceof Error ? error.message : "Request failed";
  return { ok: false, code: "error", message };
}

async function safeAction<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (error) {
    return toActionError(error);
  }
}

/** Prefetch media detail data into L2 cache. */
export async function prefetchMediaDetailAction(mediaId: number): Promise<void> {
  await safeAction(() => getMediaDetail(mediaId));
}

/** Global search across anime, manga, characters, and staff. */
export async function globalSearchAction(query: string): Promise<GlobalSearchActionResult> {
  return safeAction(() => getGlobalSearch(query));
}

/** Browse infinite scroll — hits the same L2 cache layer as SSR. */
export async function loadMediaPage(
  params: AnimeListParams,
  page: number,
  currentSeason: AnimeSeason,
  nextSeason: AnimeSeason,
): Promise<MediaPageActionResult> {
  return safeAction(async () => {
    const filter = paramsToMediaQuery(params, currentSeason, nextSeason);
    const variables = {
      ...filter,
      page,
      perPage: LISTING_PAGE_SIZE,
    } as MediaPageQueryVariables;

    return getMediaPage(variables);
  });
}

/** Batched card hover tooltips — up to 8 IDs per AniList HTTP request. */
export async function getMediaCardTooltipsBatchAction(
  mediaIds: number[],
): Promise<TooltipBatchActionResult> {
  return safeAction(async () => {
    const merged: Record<number, MediaCardTooltip | null> = {};

    for (const chunk of chunkTooltipBatchIds(mediaIds)) {
      const batch = await getMediaCardTooltipBatch(chunk);
      for (const [mediaId, tooltip] of batch) {
        merged[mediaId] = tooltip;
      }
    }

    return merged;
  });
}

/** Airing weekday tab count — lightweight id-only query; same L2 as `anilist.airingScheduleCountForDay`. */
export async function loadAiringDayCount(dateKey: string): Promise<ActionResult<number>> {
  return safeAction(() => getAiringScheduleCountForDay(dateKey));
}

/** Airing weekday tab — lazy after SSR priority day; same L2 as `anilist.airingSchedulesForDay`. */
export async function loadAiringDay(dateKey: string): Promise<AiringDayActionResult> {
  return safeAction(() => getAiringSchedulesForDay(dateKey));
}

/** All weekday tab counts in one server round trip (L2 hits skip AniList). */
export async function loadAiringWeekCounts(
  dateKeys: readonly string[],
): Promise<AiringWeekCountsActionResult> {
  return safeAction(async () => {
    const entries = await Promise.all(
      dateKeys.map(async (dateKey) => {
        const count = await getAiringScheduleCountForDay(dateKey);
        return [dateKey, count] as const;
      }),
    );
    return Object.fromEntries(entries);
  });
}
