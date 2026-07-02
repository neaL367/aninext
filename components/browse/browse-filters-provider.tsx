"use client";

import {
  createContext,
  use,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import { prefetchBrowseMediaPage } from "@/lib/anilist/client/browse-page-prefetch";
import { useAnimeListParams } from "@/lib/hooks/use-anime-list-params";
import type { GenreOption } from "@/lib/anilist/domain/genres";
import type { AnimeSeason } from "@/lib/anilist/domain/season";
import type { AnimeListParams } from "@/lib/browse/params";
import { DEFAULT_ANIME_LIST_PARAMS } from "@/lib/browse/params/types";

type BrowseFiltersState = {
  params: AnimeListParams;
};

type BrowseFiltersActions = {
  applyFilters: (params: AnimeListParams) => void;
  resetFilters: () => void;
  setSearchInput: (value: string) => void;
  prefetchFilters: (params: AnimeListParams) => void;
};

type BrowseFiltersMeta = {
  searchRef: RefObject<HTMLInputElement | null>;
  genres: GenreOption[];
  currentSeason: AnimeSeason;
  nextSeason: AnimeSeason;
};

type BrowseFiltersContextValue = {
  state: BrowseFiltersState;
  actions: BrowseFiltersActions;
  meta: BrowseFiltersMeta;
};

const BrowseFiltersContext = createContext<BrowseFiltersContextValue | null>(null);

export function useBrowseFilters() {
  const context = use(BrowseFiltersContext);
  if (!context) {
    throw new Error("useBrowseFilters must be used within BrowseFiltersProvider");
  }
  return context;
}

type BrowseFiltersProviderProps = {
  genres: GenreOption[];
  currentSeason: AnimeSeason;
  nextSeason: AnimeSeason;
  children: ReactNode;
};

export function BrowseFiltersProvider({
  genres,
  currentSeason,
  nextSeason,
  children,
}: BrowseFiltersProviderProps) {
  "use memo";

  const searchRef = useRef<HTMLInputElement>(null);
  const { params, applyFilters, resetFilters, setSearchInput } = useAnimeListParams();

  const prefetchFilters = useCallback(
    (next: AnimeListParams) => {
      prefetchBrowseMediaPage(next, currentSeason, nextSeason);
    },
    [currentSeason, nextSeason],
  );

  const applyFiltersWithPrefetch = useCallback(
    (next: AnimeListParams) => {
      prefetchFilters(next);
      applyFilters(next);
    },
    [applyFilters, prefetchFilters],
  );

  const setSearchInputWithPrefetch = useCallback(
    (value: string) => {
      prefetchFilters({ ...params, q: value });
      setSearchInput(value);
    },
    [params, prefetchFilters, setSearchInput],
  );

  const resetFiltersWithFocus = useCallback(() => {
    prefetchFilters(DEFAULT_ANIME_LIST_PARAMS);
    resetFilters();
    searchRef.current?.focus();
  }, [prefetchFilters, resetFilters]);

  const value = useMemo<BrowseFiltersContextValue>(
    () => ({
      state: { params },
      actions: {
        applyFilters: applyFiltersWithPrefetch,
        resetFilters: resetFiltersWithFocus,
        setSearchInput: setSearchInputWithPrefetch,
        prefetchFilters,
      },
      meta: {
        searchRef,
        genres,
        currentSeason,
        nextSeason,
      },
    }),
    [
      applyFiltersWithPrefetch,
      currentSeason,
      genres,
      nextSeason,
      params,
      prefetchFilters,
      resetFiltersWithFocus,
      setSearchInputWithPrefetch,
    ],
  );

  return <BrowseFiltersContext value={value}>{children}</BrowseFiltersContext>;
}
