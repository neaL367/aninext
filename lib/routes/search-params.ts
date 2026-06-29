import type { MediaFormat, MediaSeason, MediaSort, MediaSource, MediaStatus } from "@/lib/anilist/types";
import {
  ANIME_SORT_LABELS,
  formatCountry,
  formatMediaFormat,
  formatMediaSeason,
  formatMediaSource,
  formatMediaStatus,
} from "@/lib/anilist/utils/labels";
import {
  LISTING_PAGE_SIZE,
  TOP_100_MAX_PAGES,
} from "@/lib/anilist/constants";

export const ANIME_SORTS = [
  "trending",
  "popular-this-season",
  "upcoming-next-season",
  "all-time-popular",
  "top-100",
] as const;

export type AnimeSort = (typeof ANIME_SORTS)[number];

export type AnimeListParams = {
  sort: AnimeSort;
  q: string;
  genres: string[];
  tags: string[];
  year: number | null;
  season: MediaSeason | null;
  formats: MediaFormat[];
  statuses: MediaStatus[];
  country: string | null;
  source: MediaSource | null;
  yearMin: number | null;
  yearMax: number | null;
  durationMin: number | null;
  durationMax: number | null;
  episodesMin: number | null;
  episodesMax: number | null;
  scoreMin: number | null;
};

const DEFAULT_PARAMS: AnimeListParams = {
  sort: "trending",
  q: "",
  genres: [],
  tags: [],
  year: null,
  season: null,
  formats: [],
  statuses: [],
  country: null,
  source: null,
  yearMin: null,
  yearMax: null,
  durationMin: null,
  durationMax: null,
  episodesMin: null,
  episodesMax: null,
  scoreMin: null,
};

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
  return ["WINTER", "SPRING", "SUMMER", "FALL"].includes(value);
}

function isMediaFormat(value: string): value is MediaFormat {
  return [
    "TV",
    "TV_SHORT",
    "MOVIE",
    "SPECIAL",
    "OVA",
    "ONA",
    "MUSIC",
  ].includes(value);
}

function isMediaStatus(value: string): value is MediaStatus {
  return [
    "FINISHED",
    "RELEASING",
    "NOT_YET_RELEASED",
    "CANCELLED",
    "HIATUS",
  ].includes(value);
}

function isMediaSource(value: string): value is MediaSource {
  return [
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
  ].includes(value);
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
  const sort = isAnimeSort(sortValue) ? sortValue : DEFAULT_PARAMS.sort;
  const sourceValue = readParam(searchParams, "source");

  return {
    ...DEFAULT_PARAMS,
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

export function animeFiltersKey(params: AnimeListParams): string {
  return JSON.stringify(params);
}

export function getListingMaxPage(sort: AnimeSort): number | null {
  return sort === "top-100" ? TOP_100_MAX_PAGES : null;
}

export function getListingHasMore(
  sort: AnimeSort,
  itemCount: number,
  pageInfoHasNext: boolean,
  currentPage: number
): boolean {
  const maxPage = getListingMaxPage(sort);
  if (maxPage !== null) {
    return currentPage < maxPage && itemCount >= currentPage * LISTING_PAGE_SIZE;
  }

  return pageInfoHasNext && itemCount >= currentPage * LISTING_PAGE_SIZE;
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

export function paramsToMediaFilter(
  params: AnimeListParams,
  currentSeason?: { season: MediaSeason; year: number },
  nextSeason?: { season: MediaSeason; year: number }
) {
  return paramsToMediaQuery(params, currentSeason, nextSeason);
}

export function paramsToMediaQuery(
  params: AnimeListParams,
  currentSeason?: { season: MediaSeason; year: number },
  nextSeason?: { season: MediaSeason; year: number }
): {
  sort: MediaSort[];
  season?: MediaSeason;
  seasonYear?: number;
  status?: MediaStatus;
  status_in?: MediaStatus[];
  search?: string;
  genre_in?: string[];
  tag_in?: string[];
  format_in?: MediaFormat[];
  countryOfOrigin?: string;
  source_in?: MediaSource[];
  averageScore_greater?: number;
  episodes_greater?: number;
  episodes_lesser?: number;
  duration_greater?: number;
  duration_lesser?: number;
  startDate_greater?: string;
  startDate_lesser?: string;
} {
  const sortMap: Record<AnimeSort, MediaSort[]> = {
    trending: ["TRENDING_DESC"],
    "popular-this-season": ["POPULARITY_DESC"],
    "upcoming-next-season": ["POPULARITY_DESC"],
    "all-time-popular": ["POPULARITY_DESC"],
    "top-100": ["SCORE_DESC"],
  };

  const statusFilter =
    params.statuses.length === 1
      ? { status: params.statuses[0] }
      : params.statuses.length > 1
        ? { status_in: params.statuses }
        : {};

  const base = {
    sort: sortMap[params.sort],
    search: params.q || undefined,
    genre_in: params.genres.length ? params.genres : undefined,
    tag_in: params.tags.length ? params.tags : undefined,
    format_in: params.formats.length ? params.formats : undefined,
    ...statusFilter,
    countryOfOrigin: params.country ?? undefined,
    source_in: params.source ? [params.source] : undefined,
    averageScore_greater: params.scoreMin ?? undefined,
    episodes_greater: params.episodesMin ?? undefined,
    episodes_lesser: params.episodesMax ?? undefined,
    duration_greater: params.durationMin ?? undefined,
    duration_lesser: params.durationMax ?? undefined,
    startDate_greater: params.yearMin
      ? `${params.yearMin}0101`
      : undefined,
    startDate_lesser: params.yearMax
      ? `${params.yearMax}1231`
      : undefined,
  };

  if (params.sort === "popular-this-season" && currentSeason) {
    return {
      ...base,
      season: params.season ?? currentSeason.season,
      seasonYear: params.year ?? currentSeason.year,
    };
  }

  if (params.sort === "upcoming-next-season" && nextSeason) {
    return {
      ...base,
      season: params.season ?? nextSeason.season,
      seasonYear: params.year ?? nextSeason.year,
      status_in: ["NOT_YET_RELEASED"],
    };
  }

  if (params.season && params.year) {
    return {
      ...base,
      season: params.season,
      seasonYear: params.year,
    };
  }

  return base;
}

export type FilterChip = {
  key: string;
  label: string;
};

export function getActiveFilterChips(params: AnimeListParams): FilterChip[] {
  const chips: FilterChip[] = [];

  if (params.q) chips.push({ key: "q", label: `Search: ${params.q}` });
  if (params.sort !== "trending") {
    chips.push({
      key: "sort",
      label: `Sort: ${ANIME_SORT_LABELS[params.sort] ?? params.sort}`,
    });
  }
  for (const format of params.formats) {
    chips.push({ key: `format:${format}`, label: formatMediaFormat(format) });
  }
  for (const status of params.statuses) {
    chips.push({ key: `status:${status}`, label: formatMediaStatus(status) });
  }
  for (const genre of params.genres) {
    chips.push({ key: `genre:${genre}`, label: genre });
  }
  for (const tag of params.tags) {
    chips.push({ key: `tag:${tag}`, label: tag });
  }
  if (params.season) {
    chips.push({ key: "season", label: formatMediaSeason(params.season) });
  }
  if (params.year) chips.push({ key: "year", label: String(params.year) });
  if (params.country) {
    chips.push({ key: "country", label: formatCountry(params.country) });
  }
  if (params.source) {
    chips.push({ key: "source", label: formatMediaSource(params.source) });
  }
  if (params.scoreMin) {
    chips.push({ key: "scoreMin", label: `Score ≥ ${params.scoreMin}%` });
  }
  if (params.episodesMin) {
    chips.push({ key: "episodesMin", label: `Episodes ≥ ${params.episodesMin}` });
  }
  if (params.episodesMax) {
    chips.push({ key: "episodesMax", label: `Episodes ≤ ${params.episodesMax}` });
  }
  if (params.durationMin) {
    chips.push({ key: "durationMin", label: `Duration ≥ ${params.durationMin}m` });
  }
  if (params.durationMax) {
    chips.push({ key: "durationMax", label: `Duration ≤ ${params.durationMax}m` });
  }
  if (params.yearMin) {
    chips.push({ key: "yearMin", label: `From ${params.yearMin}` });
  }
  if (params.yearMax) {
    chips.push({ key: "yearMax", label: `Until ${params.yearMax}` });
  }

  return chips;
}

export function countActiveFilters(params: AnimeListParams): number {
  return getActiveFilterChips(params).length;
}

/** Active filters excluding search and sort (for the filter button badge). */
export function countBrowseFilters(params: AnimeListParams): number {
  let count = 0;
  if (params.formats.length) count += params.formats.length;
  if (params.statuses.length) count += params.statuses.length;
  if (params.genres.length) count += params.genres.length;
  if (params.tags.length) count += params.tags.length;
  if (params.season) count += 1;
  if (params.year) count += 1;
  if (params.country) count += 1;
  if (params.source) count += 1;
  if (params.scoreMin) count += 1;
  if (params.episodesMin) count += 1;
  if (params.episodesMax) count += 1;
  if (params.durationMin) count += 1;
  if (params.durationMax) count += 1;
  if (params.yearMin) count += 1;
  if (params.yearMax) count += 1;
  return count;
}

export function removeFilterChip(
  params: AnimeListParams,
  chipKey: string
): AnimeListParams {
  if (chipKey === "q") return { ...params, q: "" };
  if (chipKey === "sort") return { ...params, sort: "trending" };
  if (chipKey === "season") return { ...params, season: null };
  if (chipKey === "year") return { ...params, year: null };
  if (chipKey === "country") return { ...params, country: null };
  if (chipKey === "source") return { ...params, source: null };
  if (chipKey === "scoreMin") return { ...params, scoreMin: null };
  if (chipKey === "episodesMin") return { ...params, episodesMin: null };
  if (chipKey === "episodesMax") return { ...params, episodesMax: null };
  if (chipKey === "durationMin") return { ...params, durationMin: null };
  if (chipKey === "durationMax") return { ...params, durationMax: null };
  if (chipKey === "yearMin") return { ...params, yearMin: null };
  if (chipKey === "yearMax") return { ...params, yearMax: null };

  if (chipKey.startsWith("format:")) {
    const format = chipKey.slice(7) as MediaFormat;
    return {
      ...params,
      formats: params.formats.filter((f) => f !== format),
    };
  }
  if (chipKey.startsWith("status:")) {
    const status = chipKey.slice(7) as MediaStatus;
    return {
      ...params,
      statuses: params.statuses.filter((s) => s !== status),
    };
  }
  if (chipKey.startsWith("genre:")) {
    const genre = chipKey.slice(6);
    return {
      ...params,
      genres: params.genres.filter((g) => g !== genre),
    };
  }
  if (chipKey.startsWith("tag:")) {
    const tag = chipKey.slice(4);
    return {
      ...params,
      tags: params.tags.filter((t) => t !== tag),
    };
  }

  return params;
}

export const DEFAULT_ANIME_LIST_PARAMS = DEFAULT_PARAMS;
