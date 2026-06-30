"use client";

import {
  parseAsInteger,
  parseAsNativeArrayOf,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { useCallback, useMemo } from "react";
import type {
  MediaFormat,
  MediaSeason,
  MediaSource,
  MediaStatus,
} from "@/lib/anilist/types";
import {
  ANIME_SORTS,
  DEFAULT_ANIME_LIST_PARAMS,
  type AnimeListParams,
} from "@/lib/routes/search-params-types";

const MEDIA_SEASONS = ["WINTER", "SPRING", "SUMMER", "FALL"] as const;
const MEDIA_FORMATS = [
  "TV",
  "TV_SHORT",
  "MOVIE",
  "SPECIAL",
  "OVA",
  "ONA",
  "MUSIC",
] as const;
const MEDIA_STATUSES = [
  "FINISHED",
  "RELEASING",
  "NOT_YET_RELEASED",
  "CANCELLED",
  "HIATUS",
] as const;
const MEDIA_SOURCES = [
  "ORIGINAL",
  "MANGA",
  "LIGHT_NOVEL",
  "VISUAL_NOVEL",
  "VIDEO_GAME",
  "OTHER",
  "NOVEL",
  "DOUJINSHI",
  "ANIME",
  "WEB_NOVEL",
  "LIVE_ACTION",
  "GAME",
  "COMIC",
  "MULTIMEDIA_PROJECT",
  "PICTURE_BOOK",
] as const;

export const animeListNuqsParsers = {
  sort: parseAsStringLiteral(ANIME_SORTS).withDefault(
    DEFAULT_ANIME_LIST_PARAMS.sort
  ),
  q: parseAsString.withDefault("").withOptions({ throttleMs: 300, shallow: true }),
  genres: parseAsNativeArrayOf(parseAsString).withDefault([]),
  tags: parseAsNativeArrayOf(parseAsString).withDefault([]),
  formats: parseAsNativeArrayOf(parseAsStringLiteral(MEDIA_FORMATS)).withDefault(
    []
  ),
  statuses: parseAsNativeArrayOf(parseAsStringLiteral(MEDIA_STATUSES)).withDefault(
    []
  ),
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

type NuqsState = {
  sort: (typeof ANIME_SORTS)[number];
  q: string;
  genres: string[];
  tags: string[];
  formats: (typeof MEDIA_FORMATS)[number][];
  statuses: (typeof MEDIA_STATUSES)[number][];
  season: (typeof MEDIA_SEASONS)[number] | null;
  source: (typeof MEDIA_SOURCES)[number] | null;
  country: string | null;
  year: number | null;
  yearMin: number | null;
  yearMax: number | null;
  durationMin: number | null;
  durationMax: number | null;
  episodesMin: number | null;
  episodesMax: number | null;
  scoreMin: number | null;
};

export function nuqsStateToParams(state: NuqsState): AnimeListParams {
  return {
    sort: state.sort,
    q: state.q,
    genres: state.genres,
    tags: state.tags,
    formats: state.formats as MediaFormat[],
    statuses: state.statuses as MediaStatus[],
    season: state.season as MediaSeason | null,
    source: state.source as MediaSource | null,
    country: state.country || null,
    year: state.year,
    yearMin: state.yearMin,
    yearMax: state.yearMax,
    durationMin: state.durationMin,
    durationMax: state.durationMax,
    episodesMin: state.episodesMin,
    episodesMax: state.episodesMax,
    scoreMin: state.scoreMin,
  };
}

export function paramsToNuqsState(params: AnimeListParams): NuqsState {
  return {
    sort: params.sort,
    q: params.q,
    genres: params.genres,
    tags: params.tags,
    formats: params.formats as NuqsState["formats"],
    statuses: params.statuses as NuqsState["statuses"],
    season: params.season as NuqsState["season"],
    source: params.source as NuqsState["source"],
    country: params.country,
    year: params.year,
    yearMin: params.yearMin,
    yearMax: params.yearMax,
    durationMin: params.durationMin,
    durationMax: params.durationMax,
    episodesMin: params.episodesMin,
    episodesMax: params.episodesMax,
    scoreMin: params.scoreMin,
  };
}

const RESET_NUQS_STATE = paramsToNuqsState(DEFAULT_ANIME_LIST_PARAMS);

export function useAnimeListParams() {
  const [state, setState] = useQueryStates(animeListNuqsParsers, {
    shallow: true,
  });

  const params = useMemo(() => nuqsStateToParams(state as NuqsState), [state]);

  const applyFilters = useCallback(
    (next: AnimeListParams) => {
      void setState(paramsToNuqsState(next));
    },
    [setState]
  );

  const resetFilters = useCallback(() => {
    void setState(RESET_NUQS_STATE);
  }, [setState]);

  const setSearchInput = useCallback(
    (value: string) => {
      void setState({ q: value });
    },
    [setState]
  );

  return {
    params,
    applyFilters,
    resetFilters,
    setSearchInput,
  };
}
