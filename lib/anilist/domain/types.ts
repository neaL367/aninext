import type {
  AiringMediaFieldsFragment,
  AiringSchedulesQuery,
  CharacterDetailFieldsFragment,
  MediaCardGridFieldsFragment,
  MediaCardTooltipFieldsFragment,
  MediaDetailFieldsFragment,
  MediaPageQuery,
  StaffDetailFieldsFragment,
} from "@/lib/anilist/generated/graphql";
import { filterNonNullMedia } from "@/lib/anilist/domain/normalize-media-list";

const MEDIA_CARD_TOOLTIP_KEYS = [
  "description",
  "bannerImage",
  "studios",
  "tags",
] as const satisfies readonly (keyof MediaCardTooltipFieldsFragment)[];

export function hasMediaCardTooltipFields(media: Partial<MediaCardTooltipFieldsFragment>): boolean {
  return MEDIA_CARD_TOOLTIP_KEYS.every((key) => Object.hasOwn(media, key));
}

export type {
  MediaFormat,
  MediaRelation,
  MediaSeason,
  MediaSort,
  MediaSource,
  MediaStatus,
  MediaType,
} from "@/lib/anilist/generated/graphql";

export type MediaCardGrid = MediaCardGridFieldsFragment;

export type MediaCardTooltip = MediaCardTooltipFieldsFragment;

export type MediaCard = MediaCardGrid &
  Partial<MediaCardTooltip> & {
    popularityPercent?: number | null;
    rank?: number;
  };

export type MediaDetail = MediaDetailFieldsFragment;

export type CharacterDetail = CharacterDetailFieldsFragment;

export type StaffDetail = StaffDetailFieldsFragment;

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

  const media = filterNonNullMedia(data.Page?.media as Array<MediaCard | null> | null | undefined);

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

export function normalizeAiringSchedules(data: AiringSchedulesQuery): AiringScheduleItem[] {
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

export function normalizeMediaDetail(data: {
  Media: MediaDetailFieldsFragment | null;
}): MediaDetail | null {
  return data.Media;
}

export function normalizeCharacterDetail(data: {
  Character: CharacterDetailFieldsFragment | null;
}): CharacterDetail | null {
  return data.Character;
}

export function normalizeStaffDetail(data: {
  Staff: StaffDetailFieldsFragment | null;
}): StaffDetail | null {
  return data.Staff;
}
