import type {
  AiringMediaFieldsFragment,
  AiringSchedulesQuery,
  MediaCardCompactFieldsFragment,
  MediaDetailFieldsFragment,
  MediaPageQuery,
} from "./generated/graphql";

export type {
  MediaFormat,
  MediaSeason,
  MediaSort,
  MediaSource,
  MediaStatus,
} from "./generated/graphql";

export type MediaCard = MediaCardCompactFieldsFragment & {
  popularityPercent?: number | null;
  rank?: number;
};

export type MediaDetail = MediaDetailFieldsFragment;

export type AiringScheduleMedia = AiringMediaFieldsFragment;

export type AiringScheduleItem = {
  id: number;
  airingAt: number;
  episode: number;
  timeUntilAiring: number;
  media: AiringScheduleMedia | null;
};

export type PageInfo = {
  total: number | null;
  perPage: number;
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
};

export type MediaPageResult = {
  media: MediaCard[];
  pageInfo: PageInfo;
};

export function normalizeMediaPageResult(data: MediaPageQuery): MediaPageResult {
  const pageInfo = data.Page?.pageInfo;
  if (
    !pageInfo ||
    pageInfo.perPage == null ||
    pageInfo.currentPage == null ||
    pageInfo.lastPage == null
  ) {
    throw new Error("Invalid AniList page info");
  }

  const media = (data.Page?.media ?? []).filter(
    (item): item is MediaCard => item !== null
  );

  return {
    media,
    pageInfo: {
      total: pageInfo.total ?? null,
      perPage: pageInfo.perPage,
      currentPage: pageInfo.currentPage,
      lastPage: pageInfo.lastPage,
      hasNextPage: pageInfo.hasNextPage ?? false,
    },
  };
}

export function normalizeAiringSchedules(
  data: AiringSchedulesQuery
): AiringScheduleItem[] {
  return (data.Page?.airingSchedules ?? [])
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .map((item) => ({
      id: item.id,
      airingAt: item.airingAt,
      episode: item.episode,
      timeUntilAiring: item.timeUntilAiring,
      media: item.media,
    }));
}

export function normalizeMediaDetail(
  data: { Media: MediaDetailFieldsFragment | null }
): MediaDetail | null {
  return data.Media;
}
