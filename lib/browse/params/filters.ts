import type { MediaFormat, MediaStatus } from "@/lib/anilist/domain/types";
import {
  ANIME_SORT_LABELS,
  formatCountry,
  formatMediaFormat,
  formatMediaSeason,
  formatMediaSource,
  formatMediaStatus,
} from "@/lib/anilist/display/labels";
import type { AnimeListParams } from "@/lib/browse/params/types";

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
