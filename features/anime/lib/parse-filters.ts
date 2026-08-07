import {
  FILTER_COUNTRIES,
  FILTER_FORMATS,
  FILTER_SEASONS,
  FILTER_STATUSES,
} from "./filter-constants";

import type { AnimeFilters } from "@/features/anime/types/anime";

function values(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value.filter(Boolean);
  return value ? [value] : [];
}

function isAllowed<T extends string>(value: string, options: readonly T[]): value is T {
  return options.includes(value as T);
}

export function parseFilters(
  searchParams: Record<string, string | string[] | undefined>,
): AnimeFilters {
  const filters: AnimeFilters = {};

  const genre = values(searchParams.genre);
  if (genre.length) filters.genre = genre;

  const format = values(searchParams.format).filter((value) => isAllowed(value, FILTER_FORMATS));
  if (format.length) filters.format = format;

  const status = values(searchParams.status).filter((value) => isAllowed(value, FILTER_STATUSES));
  if (status.length) filters.status = status;

  const season = searchParams.season;
  if (
    typeof season === "string" &&
    isAllowed(
      season,
      FILTER_SEASONS.map(({ value }) => value),
    )
  ) {
    filters.season = season;
  }

  const year = searchParams.year;
  if (typeof year === "string") {
    const y = Number(year);
    if (Number.isInteger(y)) filters.year = y;
  }

  const country = searchParams.country;
  if (typeof country === "string" && FILTER_COUNTRIES.some(({ value }) => value === country)) {
    filters.country = country;
  }

  const search = searchParams.search;
  if (typeof search === "string" && search.trim()) filters.search = search.trim();

  const isAdult = searchParams.isAdult;
  if (isAdult === "true") filters.isAdult = true;
  else if (isAdult === "false") filters.isAdult = false;

  return filters;
}

export function buildFilterHash(filters: AnimeFilters): string {
  const parts: string[] = [];
  const addList = (key: string, list?: string[]) => {
    if (list?.length) parts.push(`${key}=${list.slice().sort().map(encodeURIComponent).join(",")}`);
  };

  addList("genre", filters.genre);
  addList("format", filters.format);
  addList("status", filters.status);
  if (filters.season) parts.push(`season=${encodeURIComponent(filters.season)}`);
  if (filters.year) parts.push(`year=${filters.year}`);
  if (filters.country) parts.push(`country=${encodeURIComponent(filters.country)}`);
  if (filters.search) parts.push(`search=${encodeURIComponent(filters.search)}`);
  if (filters.isAdult !== undefined) parts.push(`isAdult=${filters.isAdult}`);
  return parts.sort().join(";");
}
