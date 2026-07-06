"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { AnimeMediaGrid, AnimeMediaGridSkeleton } from "@/components/anime/anime-media-grid";
import { AnimeBrowseToolbar } from "@/components/browse/anime-browse-toolbar";
import {
  BrowseFiltersProvider,
  useBrowseFilters,
} from "@/components/browse/browse-filters-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { AniListRateLimitNotice } from "@/components/shared/anilist-rate-limit-notice";
import { consumeBrowseMediaPagePrefetch } from "@/lib/anilist/client/browse-page-prefetch";
import { serializeBrowseFilterKey } from "@/lib/anilist/client/media-page-list";
import { loadMediaPage } from "@/lib/anilist/server/actions";
import { peekBrowseRestore } from "@/lib/navigation/browse-restore";
import type { GenreOption } from "@/lib/anilist/domain/genres";
import type { AnimeSeason } from "@/lib/anilist/domain/season";
import type { MediaPageResult } from "@/lib/anilist/domain/types";
import type { AnimeListParams } from "@/lib/browse/params";
import { useBrowseInfiniteScroll } from "@/components/browse/parts/use-browse-infinite-scroll";
import { useBrowseScrollRestore } from "@/components/browse/parts/use-browse-scroll-restore";
import { restoreScrollWithRetry } from "@/lib/navigation/scroll-restore";

type AnimeBrowseProps = {
  genres: GenreOption[];
  currentSeason: AnimeSeason;
  nextSeason: AnimeSeason;
  initialParams: AnimeListParams;
  initialResult: MediaPageResult;
};

export function AnimeBrowseResults({
  initialParams,
  initialResult,
}: {
  initialParams: AnimeListParams;
  initialResult: MediaPageResult;
}) {
  const { state, meta } = useBrowseFilters();
  const { params } = state;
  const { currentSeason, nextSeason } = meta;
  const pathname = usePathname() || "/";
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);
  const previousFilterKeyRef = useRef<string | null>(null);
  const [, startTransition] = useTransition();

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
  const [isRefetching, setIsRefetching] = useState(false);

  const { media, showLoadMore, beginScrollRestore, isFetchingNextPage } = useBrowseInfiniteScroll({
    params,
    currentSeason,
    nextSeason,
    filterKey,
    pages,
    setPages,
    setRateLimited,
    loadMoreRef,
  });

  useBrowseScrollRestore({
    pathname,
    filterKey,
    pages,
    setPages,
    onRestore: (scrollY, shouldResumeLoadMore) => {
      if (scrollY > 0) {
        restoreScrollWithRetry(scrollY);
      }
      beginScrollRestore(scrollY, shouldResumeLoadMore);
    },
  });

  useEffect(() => {
    const previousKey = previousFilterKeyRef.current;
    if (previousKey === filterKey) return;

    previousFilterKeyRef.current = filterKey;

    // If we are transitioning to a new filter set, we should clear the old pages
    // to prevent displaying stale data while the new request is in flight.
    // We only keep the pages if we're restoring from cache (handled in useBrowseScrollRestore).
    const currentHref = `${pathname}${typeof window !== "undefined" ? window.location.search : ""}`;
    const cached = peekBrowseRestore(currentHref);
    if (!(cached && cached.filterKey === filterKey)) {
      setPages([]);
    }

    const requestId = ++requestIdRef.current;
    setIsRefetching(true);

    const prefetched = consumeBrowseMediaPagePrefetch(filterKey);
    const request = prefetched ?? loadMediaPage(params, 1, currentSeason, nextSeason);

    void request.then((result) => {
      if (requestId !== requestIdRef.current) return;

      if (!result.ok) {
        if (result.code === "rate_limit") setRateLimited(true);
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

      {!media.length && isRefetching ? (
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
  return (
    <BrowseFiltersProvider genres={genres} currentSeason={currentSeason} nextSeason={nextSeason}>
      <AnimeBrowseToolbar />
      <AnimeBrowseResults initialParams={initialParams} initialResult={initialResult} />
    </BrowseFiltersProvider>
  );
}
