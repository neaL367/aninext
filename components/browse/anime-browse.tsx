"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { AnimeMediaGrid, AnimeMediaGridSkeleton } from "@/components/anime/anime-media-grid";
import { AnimeBrowseToolbar } from "@/components/browse/anime-browse-toolbar";
import {
  BrowseFiltersProvider,
  useBrowseFilters,
} from "@/components/browse/browse-filters-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { AniListRateLimitNotice } from "@/components/shared/anilist-rate-limit-notice";
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

type AnimeBrowseProps = {
  genres: GenreOption[];
  currentSeason: AnimeSeason;
  nextSeason: AnimeSeason;
  initialParams: AnimeListParams;
  initialResult: MediaPageResult;
};

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
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isFetchingNextPageRef = useRef(false);
  const requestIdRef = useRef(0);
  const previousFilterKeyRef = useRef<string | null>(null);

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
  const [isPending, startTransition] = useTransition();

  const rankTop100 = params.sort === "top-100";
  const media = useMemo(() => mergeInfiniteMediaPages(pages, rankTop100), [pages, rankTop100]);
  const nextPage = getNextPageNumber(pages, params);
  const showLoadMore = canLoadMorePages(pages, params, media.length);
  const isPlaceholderData = isPending && pages.length > 0;

  isFetchingNextPageRef.current = isFetchingNextPage;

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

    startTransition(() => {
      void loadMediaPage(params, 1, currentSeason, nextSeason).then((result) => {
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
        setPages([result.data]);
      });
    });
  }, [filterKey, params, currentSeason, nextSeason]);

  const fetchNextPage = useCallback(async () => {
    if (!nextPage || isFetchingNextPageRef.current) {
      return;
    }

    isFetchingNextPageRef.current = true;
    setIsFetchingNextPage(true);

    const requestId = requestIdRef.current;

    try {
      const result = await loadMediaPage(params, nextPage, currentSeason, nextSeason);

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
  }, [nextPage, params, currentSeason, nextSeason]);

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element || !showLoadMore || isPlaceholderData) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPageRef.current) {
          void fetchNextPage();
        }
      },
      { rootMargin: "600px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [fetchNextPage, isPlaceholderData, showLoadMore]);

  if (rateLimited) {
    return <AniListRateLimitNotice title="Unable to load anime list" />;
  }

  const showInitialSkeleton = isPending && pages.length === 0;
  const showSearchOverlay = isPending && pages.length > 0;

  return (
    <div className="relative flex flex-col gap-4">
      {showInitialSkeleton ? (
        <AnimeMediaGridSkeleton layout="browse" />
      ) : !media.length ? (
        <EmptyState
          title="No anime matched your filters"
          description="Try different keywords or clear some filters."
        />
      ) : (
        <div className={showSearchOverlay ? "opacity-60" : ""} aria-busy={showSearchOverlay}>
          <AnimeMediaGrid layout="browse" media={media} />
        </div>
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
