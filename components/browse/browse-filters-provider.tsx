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
import { useAnimeListParams } from "@/lib/routes/anime-list-nuqs";
import type { GenreOption } from "@/lib/anilist/server/get-genre-collection";
import type { AnimeSeason } from "@/lib/anilist/utils/season";
import type { AnimeListParams } from "@/lib/routes/search-params";

type BrowseFiltersState = {
  params: AnimeListParams;
};

type BrowseFiltersActions = {
  applyFilters: (params: AnimeListParams) => void;
  resetFilters: () => void;
  setSearchInput: (value: string) => void;
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

const BrowseFiltersContext = createContext<BrowseFiltersContextValue | null>(
  null
);

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
  const { params, applyFilters, resetFilters, setSearchInput } =
    useAnimeListParams();

  const resetFiltersWithFocus = useCallback(() => {
    resetFilters();
    searchRef.current?.focus();
  }, [resetFilters]);

  const value = useMemo<BrowseFiltersContextValue>(
    () => ({
      state: { params },
      actions: {
        applyFilters,
        resetFilters: resetFiltersWithFocus,
        setSearchInput,
      },
      meta: {
        searchRef,
        genres,
        currentSeason,
        nextSeason,
      },
    }),
    [applyFilters, currentSeason, genres, nextSeason, params, resetFiltersWithFocus, setSearchInput]
  );

  return (
    <BrowseFiltersContext value={value}>{children}</BrowseFiltersContext>
  );
}
