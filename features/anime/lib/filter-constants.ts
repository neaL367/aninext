import { SEASONS } from "./season";

export const FILTER_FORMATS = ["TV", "TV_SHORT", "MOVIE", "SPECIAL", "OVA", "ONA", "MUSIC"];

export const FILTER_STATUSES = ["FINISHED", "RELEASING", "NOT_YET_RELEASED", "CANCELLED", "HIATUS"];

export const FILTER_COUNTRIES = [
  { value: "JP", label: "Japan" },
  { value: "KR", label: "South Korea" },
  { value: "CN", label: "China" },
  { value: "TW", label: "Taiwan" },
];

export const FILTER_SEASONS = SEASONS.map((season) => ({
  value: season,
  label: season.charAt(0) + season.slice(1).toLowerCase(),
}));

export const FILTER_ADULT_GENRES = ["Ecchi", "Hentai"];

export const FILTER_TYPE_LABELS: Record<string, string> = {
  search: "Search",
  genre: "Genre",
  format: "Format",
  status: "Status",
  season: "Season",
  year: "Year",
  country: "Country",
  isAdult: "Content",
};

export const FILTER_ORDER = ["search", "genre", "format", "status", "season", "year", "country", "isAdult"];

export function getYears(count: number = 30): number[] {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: count }, (_, i) => currentYear - i);
}

export { formatFilterValue } from "./labels";
