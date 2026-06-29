import { TOP_100_MAX_PAGES } from "@/lib/anilist/constants";
import type { MediaFormat, MediaSeason, MediaSort, MediaSource, MediaStatus } from "@/lib/anilist/types";
import type { AnimeListParams, AnimeSort } from "@/lib/routes/search-params-types";

export function getListingMaxPage(sort: AnimeSort): number | null {
  return sort === "top-100" ? TOP_100_MAX_PAGES : null;
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
    startDate_greater: params.yearMin ? `${params.yearMin}0101` : undefined,
    startDate_lesser: params.yearMax ? `${params.yearMax}1231` : undefined,
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
