"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  consumeBrowseMediaPagePrefetch,
  prefetchBrowseNextMediaPage,
} from "@/lib/anilist/client/browse-page-prefetch";
import {
  canLoadMorePages,
  getNextPageNumber,
  mergeInfiniteMediaPages,
} from "@/lib/anilist/client/media-page-list";
import { loadMediaPage } from "@/lib/anilist/server/actions";
import type { AnimeSeason } from "@/lib/anilist/domain/season";
import type { MediaPageResult } from "@/lib/anilist/domain/types";
import type { AnimeListParams } from "@/lib/browse/params";
import { shouldPrefetchBrowseSearch } from "@/lib/browse/params/search";

type UseBrowseInfiniteScrollProps = {
  params: AnimeListParams;
  currentSeason: AnimeSeason;
  nextSeason: AnimeSeason;
  filterKey: string;
  pages: MediaPageResult[];
  setPages: React.Dispatch<React.SetStateAction<MediaPageResult[]>>;
  setRateLimited: React.Dispatch<React.SetStateAction<boolean>>;
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
};

const LOAD_MORE_ROOT_MARGIN_PX = 250;

export function useBrowseInfiniteScroll({
  params,
  currentSeason,
  nextSeason,
  filterKey,
  pages,
  setPages,
  setRateLimited,
  loadMoreRef,
}: UseBrowseInfiniteScrollProps) {
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const requestIdRef = useRef(0);
  const pauseLoadMoreUntilRef = useRef(0);
  const resumeLoadMoreAfterRestoreRef = useRef(false);
  const resumeLoadMoreTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchNextPageRef = useRef<(() => Promise<void>) | null>(null);

  const rankTop100 = params.sort === "top-100";
  const media = mergeInfiniteMediaPages(pages, rankTop100);
  const nextPage = getNextPageNumber(pages, params);
  const showLoadMore = canLoadMorePages(pages, params, media.length);

  const clearResumeLoadMoreTimeout = useCallback(() => {
    if (resumeLoadMoreTimeoutRef.current) {
      clearTimeout(resumeLoadMoreTimeoutRef.current);
      resumeLoadMoreTimeoutRef.current = null;
    }
  }, []);

  const scheduleResumeLoadMoreCheck = useCallback(() => {
    clearResumeLoadMoreTimeout();

    resumeLoadMoreTimeoutRef.current = setTimeout(
      () => {
        resumeLoadMoreTimeoutRef.current = null;
        const shouldForceResume = resumeLoadMoreAfterRestoreRef.current;
        resumeLoadMoreAfterRestoreRef.current = false;

        if (Date.now() < pauseLoadMoreUntilRef.current || isFetchingNextPage) {
          return;
        }

        const element = loadMoreRef.current;
        if (!element) return;

        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const withinObserverRange =
          rect.top <= viewportHeight + LOAD_MORE_ROOT_MARGIN_PX &&
          rect.bottom >= -LOAD_MORE_ROOT_MARGIN_PX;

        if (withinObserverRange || shouldForceResume) {
          void fetchNextPageRef.current?.();
        }
      },
      Math.max(0, pauseLoadMoreUntilRef.current - Date.now()) + 16,
    );
  }, [clearResumeLoadMoreTimeout, loadMoreRef]);

  const beginScrollRestore = useCallback(
    (scrollY: number, shouldResumeLoadMore = false) => {
      pauseLoadMoreUntilRef.current = Date.now() + 700;
      resumeLoadMoreAfterRestoreRef.current = shouldResumeLoadMore;
      scheduleResumeLoadMoreCheck();
      // Note: Actual scroll restoration is handled by the separate hook
    },
    [scheduleResumeLoadMoreCheck],
  );

  const fetchNextPage = useCallback(async () => {
    if (!nextPage || isFetchingNextPage) return;

    setIsFetchingNextPage(true);
    const requestId = requestIdRef.current;

    try {
      const prefetched = consumeBrowseMediaPagePrefetch(filterKey, nextPage);
      const result = prefetched
        ? await prefetched
        : await loadMediaPage(params, nextPage, currentSeason, nextSeason);

      if (requestId !== requestIdRef.current) return;

      if (!result.ok) {
        if (result.code === "rate_limit") setRateLimited(true);
        return;
      }

      setRateLimited(false);
      setPages((current) => [...current, result.data]);
    } finally {
      setIsFetchingNextPage(false);
    }
  }, [nextPage, params, currentSeason, nextSeason, filterKey, setPages, setRateLimited, isFetchingNextPage]);

  fetchNextPageRef.current = fetchNextPage;

  useEffect(() => {
    if (!nextPage || !shouldPrefetchBrowseSearch(params.q)) return;
    prefetchBrowseNextMediaPage(params, nextPage, currentSeason, nextSeason);
  }, [nextPage, params, currentSeason, nextSeason]);

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element || !showLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const isIntersecting = entries[0]?.isIntersecting;
        if (!isIntersecting) return;

        if (Date.now() < pauseLoadMoreUntilRef.current) {
          scheduleResumeLoadMoreCheck();
          return;
        }

        if (!isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: `${LOAD_MORE_ROOT_MARGIN_PX}px` },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      clearResumeLoadMoreTimeout();
    };
  }, [
    fetchNextPage,
    showLoadMore,
    scheduleResumeLoadMoreCheck,
    clearResumeLoadMoreTimeout,
    loadMoreRef,
  ]);

  return {
    media,
    nextPage,
    showLoadMore,
    fetchNextPage,
    beginScrollRestore,
    isFetchingNextPage,
  };
}
