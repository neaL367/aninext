"use client";

import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimeGrid, AnimeGridSkeleton } from "@/components/anime/anime-grid";
import { AnimeBrowseToolbar } from "@/components/browse/anime-browse-toolbar";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { LISTING_PAGE_SIZE } from "@/lib/anilist/constants";
import { mediaPageInfiniteOptions } from "@/lib/anilist/query-options.client";
import {
  getCurrentAnimeSeason,
  getNextAnimeSeason,
} from "@/lib/anilist/utils/season";
import {
  buildAnimeBrowseHref,
  readAnimeBrowseParamsFromLocation,
  replaceAnimeBrowseUrl,
} from "@/lib/routes/browse-url";
import {
  DEFAULT_ANIME_LIST_PARAMS,
  getListingMaxPage,
  type AnimeListParams,
} from "@/lib/routes/search-params";

type GenreOption = { id: number; name: string };

type AnimeBrowseProps = {
  initialParams: AnimeListParams;
  genres: GenreOption[];
};

export function AnimeBrowse({ initialParams, genres }: AnimeBrowseProps) {
  const searchRef = useRef<HTMLInputElement>(null);
  const [filterParams, setFilterParams] = useState(initialParams);
  const [searchInput, setSearchInput] = useState(initialParams.q);
  const debouncedSearch = useDebouncedValue(searchInput, 300);
  const debouncedFilterParams = useDebouncedValue(filterParams, 200);

  const effectiveParams = useMemo(
    () => ({ ...debouncedFilterParams, q: debouncedSearch }),
    [debouncedFilterParams, debouncedSearch]
  );

  const serverParamsKey = buildAnimeBrowseHref(initialParams);

  useEffect(() => {
    setFilterParams(initialParams);
    setSearchInput(initialParams.q);
  }, [serverParamsKey, initialParams]);

  const currentSeason = useMemo(() => getCurrentAnimeSeason(), []);
  const nextSeason = useMemo(() => getNextAnimeSeason(), []);

  const {
    data,
    isPending,
    isFetching,
    isFetchingNextPage,
    isPlaceholderData,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    ...mediaPageInfiniteOptions(effectiveParams, currentSeason, nextSeason),
    placeholderData: keepPreviousData,
  });

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const maxPage = getListingMaxPage(effectiveParams.sort);
  const media = data?.media ?? [];

  useEffect(() => {
    replaceAnimeBrowseUrl(effectiveParams);
  }, [effectiveParams]);

  useEffect(() => {
    const onPopState = () => {
      const next = readAnimeBrowseParamsFromLocation();
      setFilterParams(next);
      setSearchInput(next.q);
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

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

  const applyFilters = useCallback((next: AnimeListParams) => {
    setFilterParams(next);
  }, []);

  const resetFilters = useCallback(() => {
    setFilterParams(DEFAULT_ANIME_LIST_PARAMS);
    setSearchInput("");
    searchRef.current?.focus();
  }, []);

  const showLoadMore =
    hasNextPage &&
    (maxPage === null || media.length < maxPage * LISTING_PAGE_SIZE);

  const showInitialSkeleton = isPending && !data;
  const showSearchOverlay =
    isFetching && !isPending && !isFetchingNextPage && isPlaceholderData;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Anime"
        description="Search and filter — use the navigation above to switch lists."
      />

      <AnimeBrowseToolbar
        filterParams={filterParams}
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        searchInputRef={searchRef}
        genres={genres}
        onApply={applyFilters}
        onReset={resetFilters}
      />

      <div className="relative flex flex-col gap-4">
        {showInitialSkeleton ? (
          <AnimeGridSkeleton variant="browse" />
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
            <AnimeGrid media={media} variant="browse" />
          </div>
        )}

        {showLoadMore ? (
          <div ref={loadMoreRef} className="py-6" aria-busy={isFetchingNextPage}>
            {isFetchingNextPage ? (
              <AnimeGridSkeleton count={4} variant="browse" />
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
