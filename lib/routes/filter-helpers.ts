import type { MediaFormat, MediaStatus } from "@/lib/anilist/types";
import type { AnimeListParams } from "@/lib/routes/search-params";

export function toggleListItem<T>(list: readonly T[], item: T): T[] {
  return list.includes(item) ? list.filter((v) => v !== item) : [...list, item];
}

export function toggleFormat(
  params: AnimeListParams,
  format: MediaFormat
): AnimeListParams {
  return {
    ...params,
    formats: toggleListItem(params.formats, format),
  };
}

export function toggleStatus(
  params: AnimeListParams,
  status: MediaStatus
): AnimeListParams {
  return {
    ...params,
    statuses: toggleListItem(params.statuses, status),
  };
}

export function toggleGenre(
  params: AnimeListParams,
  genre: string
): AnimeListParams {
  return {
    ...params,
    genres: toggleListItem(params.genres, genre),
  };
}
