import { SEASONS } from "./season";

export const FILTER_FORMATS = [
  "TV",
  "TV_SHORT",
  "MOVIE",
  "SPECIAL",
  "OVA",
  "ONA",
  "MUSIC",
] as const;

export const FILTER_STATUSES = [
  "FINISHED",
  "RELEASING",
  "NOT_YET_RELEASED",
  "CANCELLED",
  "HIATUS",
] as const;

export const FILTER_COUNTRIES = [
  { value: "JP", label: "Japan" },
  { value: "KR", label: "South Korea" },
  { value: "CN", label: "China" },
  { value: "TW", label: "Taiwan" },
] as const;

export const FILTER_SEASONS = SEASONS.map((season) => ({
  value: season,
  label: season.charAt(0) + season.slice(1).toLowerCase(),
}));

export const FILTER_ADULT_GENRES = ["Ecchi", "Hentai"] as const;

export type FilterKey =
  | "search"
  | "genre"
  | "format"
  | "status"
  | "season"
  | "year"
  | "country"
  | "isAdult";

export type FilterState = {
  genre: string[];
  format: string[];
  status: string[];
  season: string;
  year: string;
  country: string;
  search: string;
  isAdult: boolean;
};

export type SearchParamReader = {
  get(name: string): string | null;
  getAll(name: string): string[];
};

export const FILTER_TYPE_LABELS: Record<FilterKey, string> = {
  search: "Search",
  genre: "Genre",
  format: "Format",
  status: "Status",
  season: "Season",
  year: "Year",
  country: "Country",
  isAdult: "Content",
};

export const FILTER_ORDER: FilterKey[] = [
  "search",
  "genre",
  "format",
  "status",
  "season",
  "year",
  "country",
  "isAdult",
];

export function getFilterState(searchParams: SearchParamReader): FilterState {
  return {
    genre: searchParams.getAll("genre"),
    format: searchParams.getAll("format"),
    status: searchParams.getAll("status"),
    season: searchParams.get("season") ?? "",
    year: searchParams.get("year") ?? "",
    country: searchParams.get("country") ?? "",
    search: searchParams.get("search") ?? "",
    isAdult: searchParams.get("isAdult") === "true",
  };
}

export function getFacetFilterCount(state: FilterState): number {
  return (
    state.genre.length +
    state.format.length +
    state.status.length +
    Number(Boolean(state.season)) +
    Number(Boolean(state.year)) +
    Number(Boolean(state.country)) +
    Number(state.isAdult)
  );
}

export function getYears(count: number = 30): number[] {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: count }, (_, i) => currentYear - i);
}

export { formatFilterValue } from "./labels";
