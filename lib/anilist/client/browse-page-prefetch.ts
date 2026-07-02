"use client";

import { loadMediaPage, type MediaPageActionResult } from "@/lib/anilist/server/actions";
import type { AnimeSeason } from "@/lib/anilist/domain/season";
import type { AnimeListParams } from "@/lib/browse/params";
import { serializeBrowseFilterKey } from "@/lib/anilist/client/media-page-list";

const inflight = new Map<string, Promise<MediaPageActionResult>>();

/** Start loading browse page 1 ahead of the URL update (search debounce, filter toggles). */
export function prefetchBrowseMediaPage(
  params: AnimeListParams,
  currentSeason: AnimeSeason,
  nextSeason: AnimeSeason,
): void {
  const filterKey = serializeBrowseFilterKey(params, currentSeason, nextSeason);
  if (inflight.has(filterKey)) {
    return;
  }

  inflight.set(filterKey, loadMediaPage(params, 1, currentSeason, nextSeason));
}

/** Returns an in-flight or completed prefetch for this filter key, if any. */
export function consumeBrowseMediaPagePrefetch(
  filterKey: string,
): Promise<MediaPageActionResult> | null {
  const pending = inflight.get(filterKey);
  if (!pending) {
    return null;
  }

  inflight.delete(filterKey);
  return pending;
}
