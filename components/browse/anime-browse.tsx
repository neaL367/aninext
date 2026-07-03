"use client";

import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { AnimeMediaGrid, AnimeMediaGridSkeleton } from "@/components/anime/anime-media-grid";
import { AnimeBrowseToolbar } from "@/components/browse/anime-browse-toolbar";
import {
  BrowseFiltersProvider,
  useBrowseFilters,
} from "@/components/browse/browse-filters-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { AniListRateLimitNotice } from "@/components/shared/anilist-rate-limit-notice";
import {
  consumeBrowseMediaPagePrefetch,
  prefetchBrowseNextMediaPage,
} from "@/lib/anilist/client/browse-page-prefetch";
import {
  canLoadMorePages,
  getNextPageNumber,
  mergeInfiniteMediaPages,
  serializeBrowseFilterKey,
} from "@/lib/anilist/client/media-page-list";
import { loadMediaPage } from "@/lib/anilist/server/actions";
import type { GenreOption } from "@/lib/anilist/domain/genres";
import type { AnimeSeason } from "@/lib/anilist/domain/season";
import type { MediaPageResult } from "@/lib/anilist/domain/types";
import type { AnimeListParams } from "@/lib/browse/params";
import { shouldPrefetchBrowseSearch } from "@/lib/browse/params/search";
import {
  consumeBrowseRestore,
  peekBrowseRestore,
  persistBrowseRestoreSnapshot,
  updateBrowseRestoreSnapshot,
} from "@/lib/navigation/browse-restore";
import {
  cancelScrollRestore,
  consumePendingScrollRestore,
  readCurrentHref,
  restoreScrollWithRetry,
} from "@/lib/navigation/scroll-restore";

type AnimeBrowseProps = {
  genres: GenreOption[];
  currentSeason: AnimeSeason;
  nextSeason: AnimeSeason;
  initialParams: AnimeListParams;
  initialResult: MediaPageResult;
};

const LOAD_MORE_ROOT_MARGIN_PX = 250;

function AnimeBrowseResults({
  initialParams,
  initialResult,
}: {
  initialParams: AnimeListParams;
  initialResult: MediaPageResult;
}) {
  "use memo";

  const { state, meta } = useBrowseFilters();
  const { params } = state;
  const { currentSeason, nextSeason } = meta;
  const pathname = usePathname() || "/";
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isFetchingNextPageRef = useRef(false);
  const requestIdRef = useRef(0);
  const previousFilterKeyRef = useRef<string | null>(null);
  const pendingScrollYRef = useRef<number | null>(null);
  const pendingResumeLoadMoreRef = useRef(false);
  const restoreWhenPageCountRef = useRef(0);
  const restoreAttemptedRef = useRef(false);
  const pagesLengthRef = useRef(0);
  const pauseLoadMoreUntilRef = useRef(0);
  const fetchNextPageRef = useRef<(() => Promise<void>) | null>(null);
  const resumeLoadMoreAfterRestoreRef = useRef(false);
  const resumeLoadMoreTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filterKey = useMemo(
    () => serializeBrowseFilterKey(params, currentSeason, nextSeason),
    [params, currentSeason, nextSeason],
  );
  const initialFilterKey = useMemo(
    () => serializeBrowseFilterKey(initialParams, currentSeason, nextSeason),
    [initialParams, currentSeason, nextSeason],
  );

  const [pages, setPages] = useState<MediaPageResult[]>(() =>
    filterKey === initialFilterKey ? [initialResult] : [],
  );
  const [rateLimited, setRateLimited] = useState(false);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [, startTransition] = useTransition();

  const rankTop100 = params.sort === "top-100";
  const media = useMemo(() => mergeInfiniteMediaPages(pages, rankTop100), [pages, rankTop100]);
  const nextPage = getNextPageNumber(pages, params);
  const showLoadMore = canLoadMorePages(pages, params, media.length);

  isFetchingNextPageRef.current = isFetchingNextPage;
  pagesLengthRef.current = pages.length;

  const clearResumeLoadMoreTimeout = useCallback(() => {
    if (resumeLoadMoreTimeoutRef.current) {
      clearTimeout(resumeLoadMoreTimeoutRef.current);
      resumeLoadMoreTimeoutRef.current = null;
    }
  }, []);

  const scheduleResumeLoadMoreCheck = useCallback(() => {
    clearResumeLoadMoreTimeout();

    resumeLoadMoreTimeoutRef.current = setTimeout(() => {
      resumeLoadMoreTimeoutRef.current = null;
      const shouldForceResume = resumeLoadMoreAfterRestoreRef.current;
      resumeLoadMoreAfterRestoreRef.current = false;

      if (Date.now() < pauseLoadMoreUntilRef.current || isFetchingNextPageRef.current) {
        return;
      }

      const element = loadMoreRef.current;
      if (!element) {
        return;
      }

      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const withinObserverRange =
        rect.top <= viewportHeight + LOAD_MORE_ROOT_MARGIN_PX &&
        rect.bottom >= -LOAD_MORE_ROOT_MARGIN_PX;

      if (withinObserverRange || shouldForceResume) {
        void fetchNextPageRef.current?.();
      }
    }, Math.max(0, pauseLoadMoreUntilRef.current - Date.now()) + 16);
  }, [clearResumeLoadMoreTimeout]);

  const beginScrollRestore = useCallback((scrollY: number, shouldResumeLoadMore = false) => {
    pauseLoadMoreUntilRef.current = Date.now() + 700;
    resumeLoadMoreAfterRestoreRef.current = shouldResumeLoadMore;
    scheduleResumeLoadMoreCheck();
    restoreScrollWithRetry(scrollY);
  }, [scheduleResumeLoadMoreCheck]);

  const tryRestoreBrowse = useCallback(() => {
    if (pathname !== "/anime" || restoreAttemptedRef.current) {
      return;
    }

    const href = readCurrentHref();
    const peek = peekBrowseRestore(href);

    if (peek) {
      restoreAttemptedRef.current = true;

      if (pagesLengthRef.current >= peek.pages.length) {
        const restored = consumeBrowseRestore(href);
        if (restored?.scrollY && restored.scrollY > 0) {
          beginScrollRestore(restored.scrollY, restored.wasNearBottom);
        }
        return;
      }

      const restored = consumeBrowseRestore(href);
      if (!restored) {
        return;
      }

      if (restored.pages.length > 0) {
        restoreWhenPageCountRef.current = restored.pages.length;
        pendingScrollYRef.current = restored.scrollY;
        pendingResumeLoadMoreRef.current = restored.wasNearBottom === true;
        setPages(restored.pages);
        return;
      }

      if (restored.scrollY > 0) {
        beginScrollRestore(restored.scrollY, restored.wasNearBottom);
      }
      return;
    }

    const pendingScrollY = consumePendingScrollRestore(href);
    if (pendingScrollY != null && pendingScrollY > 0) {
      restoreAttemptedRef.current = true;
      beginScrollRestore(pendingScrollY);
    }
  }, [pathname, beginScrollRestore]);

  useEffect(() => {
    if (pathname !== "/anime") {
      restoreAttemptedRef.current = false;
      clearResumeLoadMoreTimeout();
      cancelScrollRestore();
    }
  }, [pathname, clearResumeLoadMoreTimeout]);

  useLayoutEffect(() => {
    tryRestoreBrowse();
  }, [tryRestoreBrowse]);

  useEffect(() => {
    if (restoreWhenPageCountRef.current === 0) {
      return;
    }

    if (pages.length < restoreWhenPageCountRef.current) {
      return;
    }

    restoreWhenPageCountRef.current = 0;
    const scrollY = pendingScrollYRef.current;
    const shouldResumeLoadMore = pendingResumeLoadMoreRef.current;
    pendingScrollYRef.current = null;
    pendingResumeLoadMoreRef.current = false;

    if (scrollY != null && scrollY > 0) {
      beginScrollRestore(scrollY, shouldResumeLoadMore);
    }
  }, [pages, beginScrollRestore]);

  useEffect(() => {
    updateBrowseRestoreSnapshot(readCurrentHref(), filterKey, pages);
  }, [filterKey, pages]);

  useEffect(() => {
    const onPageHide = () => {
      persistBrowseRestoreSnapshot();
    };

    window.addEventListener("pagehide", onPageHide);
    return () => window.removeEventListener("pagehide", onPageHide);
  }, [filterKey, pages]);

  useEffect(() => {
    const onPopState = () => {
      requestAnimationFrame(() => {
        tryRestoreBrowse();
      });
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [tryRestoreBrowse]);

  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        tryRestoreBrowse();
      }
    };

    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [tryRestoreBrowse]);

  useEffect(() => {
    const previousKey = previousFilterKeyRef.current;
    if (previousKey === filterKey) {
      return;
    }

    previousFilterKeyRef.current = filterKey;

    if (previousKey === null) {
      return;
    }

    const requestId = ++requestIdRef.current;
    setIsRefetching(true);

    const prefetched = consumeBrowseMediaPagePrefetch(filterKey);
    const request = prefetched ?? loadMediaPage(params, 1, currentSeason, nextSeason);

    void request.then((result) => {
      if (requestId !== requestIdRef.current) {
        return;
      }

      if (!result.ok) {
        if (result.code === "rate_limit") {
          setRateLimited(true);
        }
        setIsRefetching(false);
        return;
      }

      setRateLimited(false);
      startTransition(() => {
        setPages([result.data]);
        setIsRefetching(false);
      });
    });
  }, [filterKey, params, currentSeason, nextSeason]);

  useEffect(() => {
    if (!nextPage || !shouldPrefetchBrowseSearch(params.q)) {
      return;
    }

    prefetchBrowseNextMediaPage(params, nextPage, currentSeason, nextSeason);
  }, [nextPage, params, currentSeason, nextSeason]);

  const fetchNextPage = useCallback(async () => {
    if (!nextPage || isFetchingNextPageRef.current) {
      return;
    }

    isFetchingNextPageRef.current = true;
    setIsFetchingNextPage(true);

    const requestId = requestIdRef.current;

    try {
      const prefetched = consumeBrowseMediaPagePrefetch(filterKey, nextPage);
      const result = prefetched
        ? await prefetched
        : await loadMediaPage(params, nextPage, currentSeason, nextSeason);

      if (requestId !== requestIdRef.current) {
        return;
      }

      if (!result.ok) {
        if (result.code === "rate_limit") {
          setRateLimited(true);
        }
        return;
      }

      setRateLimited(false);
      setPages((current) => [...current, result.data]);
    } finally {
      isFetchingNextPageRef.current = false;
      setIsFetchingNextPage(false);
    }
  }, [nextPage, params, currentSeason, nextSeason, filterKey]);

  fetchNextPageRef.current = fetchNextPage;

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element || !showLoadMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const isIntersecting = entries[0]?.isIntersecting;
        if (!isIntersecting) {
          return;
        }

        if (Date.now() < pauseLoadMoreUntilRef.current) {
          scheduleResumeLoadMoreCheck();
          return;
        }

        if (!isFetchingNextPageRef.current) {
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
  }, [fetchNextPage, showLoadMore, scheduleResumeLoadMoreCheck, clearResumeLoadMoreTimeout]);

  const showEmptyRateLimit = rateLimited && media.length === 0;

  if (showEmptyRateLimit) {
    return <AniListRateLimitNotice title="Unable to load anime list" />;
  }

  const showInitialSkeleton = isRefetching && media.length === 0;

  return (
    <div className="relative flex flex-col gap-4">
      {rateLimited ? (
        <AniListRateLimitNotice title="Could not load more results" variant="section" />
      ) : null}

      {isRefetching ? (
        <p className="text-xs text-muted-foreground" aria-live="polite">
          Updating results…
        </p>
      ) : null}

      {showInitialSkeleton ? (
        <AnimeMediaGridSkeleton layout="browse" />
      ) : !media.length ? (
        <EmptyState
          title="No anime matched your filters"
          description="Try different keywords or clear some filters."
        />
      ) : (
        <AnimeMediaGrid layout="browse" media={media} />
      )}

      {showLoadMore ? (
        <div ref={loadMoreRef} className="py-6" aria-busy={isFetchingNextPage}>
          {isFetchingNextPage ? <AnimeMediaGridSkeleton layout="browse" count={4} /> : null}
        </div>
      ) : null}
    </div>
  );
}

export function AnimeBrowse({
  genres,
  currentSeason,
  nextSeason,
  initialParams,
  initialResult,
}: AnimeBrowseProps) {
  "use memo";

  return (
    <BrowseFiltersProvider genres={genres} currentSeason={currentSeason} nextSeason={nextSeason}>
      <AnimeBrowseToolbar />
      <AnimeBrowseResults initialParams={initialParams} initialResult={initialResult} />
    </BrowseFiltersProvider>
  );
}
