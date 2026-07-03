"use client";

import { loadMediaPage, type MediaPageActionResult } from "@/lib/anilist/server/actions";
import type { AnimeSeason } from "@/lib/anilist/domain/season";
import type { AnimeListParams } from "@/lib/browse/params";
import { shouldPrefetchBrowseSearch } from "@/lib/browse/params/search";
import { serializeBrowseFilterKey } from "@/lib/anilist/client/media-page-list";

const inflight = new Map<string, Promise<MediaPageActionResult>>();

function prefetchCacheKey(filterKey: string, page: number): string {
  return `${filterKey}::${page}`;
}

function logPrefetchSkip(reason: "min_length" | "duplicate", key: string): void {
  if (process.env.NODE_ENV !== "development") {
    return;
  }
  console.log(`[anilist-prefetch] skipped reason=${reason} key=${key}`);
}

function startBrowseMediaPagePrefetch(
  params: AnimeListParams,
  page: number,
  currentSeason: AnimeSeason,
  nextSeason: AnimeSeason,
): void {
  const filterKey = serializeBrowseFilterKey(params, currentSeason, nextSeason);
  const key = prefetchCacheKey(filterKey, page);

  if (!shouldPrefetchBrowseSearch(params.q)) {
    logPrefetchSkip("min_length", key);
    return;
  }

  if (inflight.has(key)) {
    logPrefetchSkip("duplicate", key);
    return;
  }

  inflight.set(key, loadMediaPage(params, page, currentSeason, nextSeason));
}

/** Start loading browse page 1 ahead of the URL update (search debounce, filter toggles). */
export function prefetchBrowseMediaPage(
  params: AnimeListParams,
  currentSeason: AnimeSeason,
  nextSeason: AnimeSeason,
): void {
  startBrowseMediaPagePrefetch(params, 1, currentSeason, nextSeason);
}

/** Warm the next infinite-scroll page while the user reads the current grid. */
export function prefetchBrowseNextMediaPage(
  params: AnimeListParams,
  page: number,
  currentSeason: AnimeSeason,
  nextSeason: AnimeSeason,
): void {
  startBrowseMediaPagePrefetch(params, page, currentSeason, nextSeason);
}

/** Returns an in-flight or completed prefetch for this filter key and page, if any. */
export function consumeBrowseMediaPagePrefetch(
  filterKey: string,
  page = 1,
): Promise<MediaPageActionResult> | null {
  const key = prefetchCacheKey(filterKey, page);
  const pending = inflight.get(key);
  if (!pending) {
    return null;
  }

  inflight.delete(key);
  return pending;
}
