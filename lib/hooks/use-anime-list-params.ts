"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  parseAsInteger,
  parseAsNativeArrayOf,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { useCallback, useMemo } from "react";
import {
  ANIME_SORTS,
  DEFAULT_ANIME_LIST_PARAMS,
  MEDIA_FORMATS,
  MEDIA_SEASONS,
  MEDIA_SOURCES,
  MEDIA_STATUSES,
  type AnimeListParams,
} from "@/lib/browse/params/types";

export const animeListNuqsParsers = {
  sort: parseAsStringLiteral(ANIME_SORTS).withDefault(DEFAULT_ANIME_LIST_PARAMS.sort),
  q: parseAsString.withDefault(""),
  genres: parseAsNativeArrayOf(parseAsString).withDefault([]),
  tags: parseAsNativeArrayOf(parseAsString).withDefault([]),
  formats: parseAsNativeArrayOf(parseAsStringLiteral(MEDIA_FORMATS)).withDefault([]),
  statuses: parseAsNativeArrayOf(parseAsStringLiteral(MEDIA_STATUSES)).withDefault([]),
  season: parseAsStringLiteral(MEDIA_SEASONS),
  source: parseAsStringLiteral(MEDIA_SOURCES),
  country: parseAsString,
  year: parseAsInteger,
  yearMin: parseAsInteger,
  yearMax: parseAsInteger,
  durationMin: parseAsInteger,
  durationMax: parseAsInteger,
  episodesMin: parseAsInteger,
  episodesMax: parseAsInteger,
  scoreMin: parseAsInteger,
};

type NuqsState = Omit<AnimeListParams, "formats" | "statuses" | "season" | "source"> & {
  formats: (typeof MEDIA_FORMATS)[number][];
  statuses: (typeof MEDIA_STATUSES)[number][];
  season: (typeof MEDIA_SEASONS)[number] | null;
  source: (typeof MEDIA_SOURCES)[number] | null;
};

export function nuqsStateToParams(state: NuqsState): AnimeListParams {
  return {
    ...state,
    country: state.country || null,
  };
}

export function paramsToNuqsState(params: AnimeListParams): NuqsState {
  return {
    ...params,
    formats: params.formats as NuqsState["formats"],
    statuses: params.statuses as NuqsState["statuses"],
    season: params.season as NuqsState["season"],
    source: params.source as NuqsState["source"],
  };
}

const RESET_NUQS_STATE = paramsToNuqsState(DEFAULT_ANIME_LIST_PARAMS);

export function useAnimeListParams() {
  "use memo";

  const queryClient = useQueryClient();
  const [state, setState] = useQueryStates(animeListNuqsParsers, {
    shallow: true,
  });

  const params = useMemo(() => nuqsStateToParams(state as NuqsState), [state]);
  const cancelBrowseQueries = useCallback(() => {
    void queryClient.cancelQueries({ queryKey: ["anilist", "media", "infinite"] });
  }, [queryClient]);

  const applyFilters = useCallback(
    (next: AnimeListParams) => {
      cancelBrowseQueries();
      void setState(paramsToNuqsState(next));
    },
    [cancelBrowseQueries, setState],
  );

  const resetFilters = useCallback(() => {
    cancelBrowseQueries();
    void setState(RESET_NUQS_STATE);
  }, [cancelBrowseQueries, setState]);

  const setSearchInput = useCallback(
    (value: string) => {
      cancelBrowseQueries();
      void setState({ q: value });
    },
    [cancelBrowseQueries, setState],
  );

  return {
    params,
    applyFilters,
    resetFilters,
    setSearchInput,
  };
}
