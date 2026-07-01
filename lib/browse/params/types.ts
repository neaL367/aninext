import type {
  MediaFormat,
  MediaSeason,
  MediaSource,
  MediaStatus,
} from "@/lib/anilist/domain/types";

export const ANIME_SORTS = [
  "trending",
  "popular-this-season",
  "upcoming-next-season",
  "all-time-popular",
  "top-100",
] as const;

export type AnimeSort = (typeof ANIME_SORTS)[number];

export const MEDIA_SEASONS = [
  "WINTER",
  "SPRING",
  "SUMMER",
  "FALL",
] as const satisfies readonly MediaSeason[];

export const MEDIA_FORMATS = [
  "TV",
  "TV_SHORT",
  "MOVIE",
  "SPECIAL",
  "OVA",
  "ONA",
  "MUSIC",
] as const satisfies readonly MediaFormat[];

export const MEDIA_STATUSES = [
  "FINISHED",
  "RELEASING",
  "NOT_YET_RELEASED",
  "CANCELLED",
  "HIATUS",
] as const satisfies readonly MediaStatus[];

export const MEDIA_SOURCES = [
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
] as const satisfies readonly MediaSource[];

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

export const DEFAULT_ANIME_LIST_PARAMS: AnimeListParams = {
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
