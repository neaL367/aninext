"use client";

import { keepPreviousData, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { AnimeMediaGrid, AnimeMediaGridSkeleton } from "@/components/anime/anime-media-grid";
import { AnimeBrowseToolbar } from "@/components/browse/anime-browse-toolbar";
import {
  BrowseFiltersProvider,
  useBrowseFilters,
} from "@/components/browse/browse-filters-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { LISTING_PAGE_SIZE } from "@/lib/anilist/domain/listing";
import { mediaPageInfiniteOptions } from "@/lib/anilist/client/query-options.client";
import type { GenreOption } from "@/lib/anilist/domain/genres";
import type { AnimeSeason } from "@/lib/anilist/domain/season";
import { getListingMaxPage } from "@/lib/browse/params";

type AnimeBrowseProps = {
  genres: GenreOption[];
  currentSeason: AnimeSeason;
  nextSeason: AnimeSeason;
};

function AnimeBrowseResults() {
  "use memo";

  const { state, meta } = useBrowseFilters();
  const { params } = state;
  const { currentSeason, nextSeason } = meta;
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isFetchingNextPageRef = useRef(false);
  const prefetchedUpToRef = useRef(0);
  const queryClient = useQueryClient();
  const infiniteQueryOptions = mediaPageInfiniteOptions(params, currentSeason, nextSeason);
  const queryKeyJson = JSON.stringify(infiniteQueryOptions.queryKey);

  const {
    data,
    isPending,
    isFetching,
    isFetchingNextPage,
    isPlaceholderData,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    ...infiniteQueryOptions,
    placeholderData: keepPreviousData,
  });

  isFetchingNextPageRef.current = isFetchingNextPage;

  const maxPage = getListingMaxPage(params.sort);
  const media = data?.media ?? [];
  const loadedPageCount = data?.pages.length ?? 0;

  useEffect(() => {
    prefetchedUpToRef.current = 0;
  }, [queryKeyJson]);

  useEffect(() => {
    if (isPlaceholderData || !hasNextPage || loadedPageCount === 0) return;

    const targetPages = loadedPageCount + 1;
    if (prefetchedUpToRef.current >= targetPages) return;

    prefetchedUpToRef.current = targetPages;
    void queryClient.prefetchInfiniteQuery({
      ...mediaPageInfiniteOptions(params, currentSeason, nextSeason),
      pages: targetPages,
    });
  }, [
    queryClient,
    queryKeyJson,
    params,
    currentSeason,
    nextSeason,
    hasNextPage,
    isPlaceholderData,
    loadedPageCount,
  ]);

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element || !hasNextPage || isPlaceholderData) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPageRef.current) {
          fetchNextPage();
        }
      },
      { rootMargin: "600px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isPlaceholderData]);

  const showLoadMore =
    !isPlaceholderData &&
    hasNextPage &&
    (maxPage === null || media.length < maxPage * LISTING_PAGE_SIZE);

  const showInitialSkeleton = isPending && !data;
  const showSearchOverlay = isFetching && !isPending && !isFetchingNextPage && isPlaceholderData;

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

export function AnimeBrowse({ genres, currentSeason, nextSeason }: AnimeBrowseProps) {
  "use memo";

  return (
    <BrowseFiltersProvider genres={genres} currentSeason={currentSeason} nextSeason={nextSeason}>
      <AnimeBrowseToolbar />
      <AnimeBrowseResults />
    </BrowseFiltersProvider>
  );
}
