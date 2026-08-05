import type { AnimeFilters } from "@/features/anime/types/anime";

export function parseFilters(
  searchParams: Record<string, string | string[] | undefined>
): AnimeFilters {
  const filters: AnimeFilters = {};

  const genre = searchParams.genre;
  if (genre) {
    filters.genre = Array.isArray(genre) ? genre : [genre];
  }

  const format = searchParams.format;
  if (format) {
    filters.format = Array.isArray(format) ? format : [format];
  }

  const status = searchParams.status;
  if (status) {
    filters.status = Array.isArray(status) ? status : [status];
  }

  const season = searchParams.season;
  if (typeof season === "string") filters.season = season;

  const year = searchParams.year;
  if (typeof year === "string") {
    const y = Number(year);
    if (!isNaN(y)) filters.year = y;
  }

  const country = searchParams.country;
  if (typeof country === "string") filters.country = country;

  const search = searchParams.search;
  if (typeof search === "string") filters.search = search;

  const isAdult = searchParams.isAdult;
  if (isAdult === "true") filters.isAdult = true;
  else if (isAdult === "false") filters.isAdult = false;

  const studio = searchParams.studio;
  if (typeof studio === "string") filters.studio = studio;

  return filters;
}

export function buildFilterHash(filters: AnimeFilters): string {
  const parts: string[] = [];
  if (filters.genre?.length) parts.push(`genre=${filters.genre.join(",")}`);
  if (filters.format?.length) parts.push(`format=${filters.format.join(",")}`);
  if (filters.status?.length) parts.push(`status=${filters.status.join(",")}`);
  if (filters.season) parts.push(`season=${filters.season}`);
  if (filters.year) parts.push(`year=${filters.year}`);
  if (filters.country) parts.push(`country=${filters.country}`);
  if (filters.search) parts.push(`search=${filters.search}`);
  if (filters.isAdult !== undefined) parts.push(`isAdult=${filters.isAdult}`);
  if (filters.studio) parts.push(`studio=${filters.studio}`);
  return parts.sort().join(";");
}
