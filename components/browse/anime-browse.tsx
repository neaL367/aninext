"use client";

import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import {
  AnimeMediaGrid,
  AnimeMediaGridSkeleton,
} from "@/components/anime/anime-media-grid";
import { AnimeBrowseToolbar } from "@/components/browse/anime-browse-toolbar";
import { BrowseFiltersProvider, useBrowseFilters } from "@/components/browse/browse-filters-provider";
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

  const {
    data,
    isPending,
    isFetching,
    isFetchingNextPage,
    isPlaceholderData,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    ...mediaPageInfiniteOptions(params, currentSeason, nextSeason),
    placeholderData: keepPreviousData,
  });

  const maxPage = getListingMaxPage(params.sort);
  const media = data?.media ?? [];

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchNextPage();
      },
      { rootMargin: "200px" }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const showLoadMore =
    hasNextPage &&
    (maxPage === null || media.length < maxPage * LISTING_PAGE_SIZE);

  const showInitialSkeleton = isPending && !data;
  const showSearchOverlay =
    isFetching && !isPending && !isFetchingNextPage && isPlaceholderData;

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
        <div
          className={showSearchOverlay ? "opacity-60" : ""}
          aria-busy={showSearchOverlay}
        >
          <AnimeMediaGrid layout="browse" media={media} />
        </div>
      )}

      {showLoadMore ? (
        <div ref={loadMoreRef} className="py-6" aria-busy={isFetchingNextPage}>
          {isFetchingNextPage ? (
            <AnimeMediaGridSkeleton layout="browse" count={4} />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function AnimeBrowse({
  genres,
  currentSeason,
  nextSeason,
}: AnimeBrowseProps) {
  "use memo";

  return (
    <BrowseFiltersProvider
      genres={genres}
      currentSeason={currentSeason}
      nextSeason={nextSeason}
    >
      <AnimeBrowseToolbar />
      <AnimeBrowseResults />
    </BrowseFiltersProvider>
  );
}
