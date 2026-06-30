import type { MediaFormat, MediaSeason, MediaSource, MediaStatus } from "@/lib/anilist/domain/types";

export const MEDIA_FORMAT_LABELS: Record<MediaFormat, string> = {
  TV: "TV",
  TV_SHORT: "TV Short",
  MOVIE: "Movie",
  SPECIAL: "Special",
  OVA: "OVA",
  ONA: "ONA",
  MUSIC: "Music",
  MANGA: "Manga",
  NOVEL: "Novel",
  ONE_SHOT: "One Shot",
};

export const MEDIA_STATUS_LABELS: Record<MediaStatus, string> = {
  RELEASING: "Airing",
  FINISHED: "Finished",
  NOT_YET_RELEASED: "Upcoming",
  CANCELLED: "Cancelled",
  HIATUS: "Hiatus",
};

export const MEDIA_SEASON_LABELS: Record<MediaSeason, string> = {
  WINTER: "Winter",
  SPRING: "Spring",
  SUMMER: "Summer",
  FALL: "Fall",
};

export const MEDIA_SOURCE_LABELS: Record<MediaSource, string> = {
  ORIGINAL: "Original",
  MANGA: "Manga",
  LIGHT_NOVEL: "Light Novel",
  VISUAL_NOVEL: "Visual Novel",
  VIDEO_GAME: "Video Game",
  OTHER: "Other",
  NOVEL: "Novel",
  DOUJINSHI: "Doujinshi",
  ANIME: "Anime",
  WEB_NOVEL: "Web Novel",
  LIVE_ACTION: "Live Action",
  GAME: "Game",
  COMIC: "Comic",
  MULTIMEDIA_PROJECT: "Multimedia",
  PICTURE_BOOK: "Picture Book",
};

export const COUNTRY_LABELS: Record<string, string> = {
  JP: "Japan",
  KR: "South Korea",
  CN: "China",
  TW: "Taiwan",
  US: "United States",
};

export const ANIME_SORT_LABELS: Record<string, string> = {
  trending: "Trending",
  "popular-this-season": "Popular this season",
  "upcoming-next-season": "Upcoming next season",
  "all-time-popular": "All-time popular",
  "top-100": "Top 100",
};

export function formatMediaFormat(format: MediaFormat | null | undefined): string {
  if (!format) return "—";
  return MEDIA_FORMAT_LABELS[format] ?? format;
}

export function formatMediaStatus(status: MediaStatus | null | undefined): string {
  if (!status) return "—";
  return MEDIA_STATUS_LABELS[status] ?? status;
}

export function formatMediaSeason(season: MediaSeason | null | undefined): string {
  if (!season) return "—";
  return MEDIA_SEASON_LABELS[season] ?? season;
}

export function formatMediaSource(source: MediaSource | null | undefined): string {
  if (!source) return "—";
  return MEDIA_SOURCE_LABELS[source] ?? source.replace(/_/g, " ");
}

export function formatCountry(code: string | null | undefined): string {
  if (!code) return "—";
  return COUNTRY_LABELS[code] ?? code;
}

export function formatSeasonYear(
  season: MediaSeason | null | undefined,
  year: number | null | undefined
): string {
  if (!season && !year) return "—";
  if (season && year) return `${formatMediaSeason(season)} ${year}`;
  return year ? String(year) : formatMediaSeason(season);
}

export function formatDuration(minutes: number | null | undefined): string {
  if (!minutes) return "—";
  return `${minutes} min`;
}
