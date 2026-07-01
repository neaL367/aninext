import type {
  MediaFormat,
  MediaSeason,
  MediaSource,
  MediaStatus,
} from "@/lib/anilist/domain/types";
import {
  ANIME_SORTS,
  DEFAULT_ANIME_LIST_PARAMS,
  MEDIA_FORMATS,
  MEDIA_SEASONS,
  MEDIA_SOURCES,
  MEDIA_STATUSES,
  type AnimeListParams,
  type AnimeSort,
} from "@/lib/browse/params/types";

function readParam(
  params: Record<string, string | string[] | undefined>,
  key: string
): string {
  const value = params[key];
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

function readNumber(value: string): number | null {
  if (!value.trim()) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function readList(
  params: Record<string, string | string[] | undefined>,
  key: string
): string[] {
  const value = params[key];
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

function isAnimeSort(value: string): value is AnimeSort {
  return (ANIME_SORTS as readonly string[]).includes(value);
}

function isMediaSeason(value: string): value is MediaSeason {
  return (MEDIA_SEASONS as readonly string[]).includes(value);
}

function isMediaFormat(value: string): value is MediaFormat {
  return (MEDIA_FORMATS as readonly string[]).includes(value);
}

function isMediaStatus(value: string): value is MediaStatus {
  return (MEDIA_STATUSES as readonly string[]).includes(value);
}

function isMediaSource(value: string): value is MediaSource {
  return (MEDIA_SOURCES as readonly string[]).includes(value);
}

function readFormats(
  searchParams: Record<string, string | string[] | undefined>
): MediaFormat[] {
  const list = readList(searchParams, "formats");
  if (list.length) {
    return list.filter(isMediaFormat);
  }
  const legacy = readParam(searchParams, "format");
  return isMediaFormat(legacy) ? [legacy] : [];
}

function readStatuses(
  searchParams: Record<string, string | string[] | undefined>
): MediaStatus[] {
  const list = readList(searchParams, "statuses");
  if (list.length) {
    return list.filter(isMediaStatus);
  }
  const legacy = readParam(searchParams, "status");
  return isMediaStatus(legacy) ? [legacy] : [];
}

export function parseAnimeListParams(
  searchParams: Record<string, string | string[] | undefined>
): AnimeListParams {
  const sortValue = readParam(searchParams, "sort");
  const sort = isAnimeSort(sortValue) ? sortValue : DEFAULT_ANIME_LIST_PARAMS.sort;
  const sourceValue = readParam(searchParams, "source");

  return {
    ...DEFAULT_ANIME_LIST_PARAMS,
    sort,
    q: readParam(searchParams, "q"),
    genres: readList(searchParams, "genres"),
    tags: readList(searchParams, "tags"),
    year: readNumber(readParam(searchParams, "year")),
    season: (() => {
      const value = readParam(searchParams, "season");
      return isMediaSeason(value) ? value : null;
    })(),
    formats: readFormats(searchParams),
    statuses: readStatuses(searchParams),
    country: readParam(searchParams, "country") || null,
    source: isMediaSource(sourceValue) ? sourceValue : null,
    yearMin: readNumber(readParam(searchParams, "yearMin")),
    yearMax: readNumber(readParam(searchParams, "yearMax")),
    durationMin: readNumber(readParam(searchParams, "durationMin")),
    durationMax: readNumber(readParam(searchParams, "durationMax")),
    episodesMin: readNumber(readParam(searchParams, "episodesMin")),
    episodesMax: readNumber(readParam(searchParams, "episodesMax")),
    scoreMin: readNumber(readParam(searchParams, "scoreMin")),
  };
}

export function animeListParamsToQuery(
  params: AnimeListParams
): Record<string, string | string[]> {
  const query: Record<string, string | string[]> = {
    sort: params.sort,
  };

  if (params.q) query.q = params.q;
  if (params.genres.length) query.genres = params.genres;
  if (params.tags.length) query.tags = params.tags;
  if (params.year) query.year = String(params.year);
  if (params.season) query.season = params.season;
  if (params.formats.length) query.formats = params.formats;
  if (params.statuses.length) query.statuses = params.statuses;
  if (params.country) query.country = params.country;
  if (params.source) query.source = params.source;
  if (params.yearMin) query.yearMin = String(params.yearMin);
  if (params.yearMax) query.yearMax = String(params.yearMax);
  if (params.durationMin) query.durationMin = String(params.durationMin);
  if (params.durationMax) query.durationMax = String(params.durationMax);
  if (params.episodesMin) query.episodesMin = String(params.episodesMin);
  if (params.episodesMax) query.episodesMax = String(params.episodesMax);
  if (params.scoreMin) query.scoreMin = String(params.scoreMin);

  return query;
}
