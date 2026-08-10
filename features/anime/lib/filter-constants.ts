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

export type FacetFilterKey = Exclude<FilterKey, "search" | "isAdult">;

export const MULTI_FILTER_KEYS = ["genre", "format", "status"] as const;

export function isMultiFilter(key: FacetFilterKey): boolean {
  return MULTI_FILTER_KEYS.includes(key as (typeof MULTI_FILTER_KEYS)[number]);
}

export function isValidFilterYear(value: string): boolean {
  const year = Number(value);
  return /^\d{4}$/.test(value) && Number.isInteger(year) && year >= 1900 && year <= 2100;
}

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

function isAllowed<T extends string>(value: string, options: readonly T[]): value is T {
  return options.includes(value as T);
}

export function getFilterState(searchParams: SearchParamReader): FilterState {
  const unique = (values: string[]) => [...new Set(values.filter(Boolean))];
  const format = unique(
    searchParams.getAll("format").filter((value) => isAllowed(value, FILTER_FORMATS)),
  );
  const status = unique(
    searchParams.getAll("status").filter((value) => isAllowed(value, FILTER_STATUSES)),
  );
  const rawSeason = searchParams.get("season") ?? "";
  const rawYear = searchParams.get("year") ?? "";
  const rawCountry = searchParams.get("country") ?? "";
  const rawSearch = searchParams.get("search") ?? "";

  return {
    genre: unique(searchParams.getAll("genre")),
    format,
    status,
    season: FILTER_SEASONS.some(({ value }) => value === rawSeason) ? rawSeason : "",
    year: isValidFilterYear(rawYear) ? rawYear : "",
    country: FILTER_COUNTRIES.some(({ value }) => value === rawCountry) ? rawCountry : "",
    search: rawSearch.trim(),
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

export { formatFilterValue, formatFormat, FORMAT_LABELS } from "./labels";
