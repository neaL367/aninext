import "server-only";

import { connection } from "next/server";
import {
  CharacterDetailDocument,
  GenreCollectionDocument,
  HomeSectionMediaDocument,
  MediaCardTooltipDocument,
  MediaDetailDocument,
  MediaPageDocument,
  StaffDetailDocument,
  type MediaPageQueryVariables,
} from "@/lib/anilist/generated/graphql";
import type { GenreOption } from "@/lib/anilist/domain/genres";
import type { HomeSectionId } from "@/lib/anilist/domain/home-sections";
import {
  normalizeHomeTop100Media,
  normalizeListedMedia,
} from "@/lib/anilist/domain/normalize-media-list";
import { sortMediaByNextAiring } from "@/lib/anilist/domain/sort-media-by-airing";
import { getCurrentAnimeSeason, getNextAnimeSeason } from "@/lib/anilist/domain/season";
import type {
  AiringScheduleItem,
  CharacterDetail,
  MediaCard,
  MediaCardTooltip,
  MediaDetail,
  MediaPageResult,
  StaffDetail,
} from "@/lib/anilist/domain/types";
import {
  normalizeCharacterDetail,
  normalizeMediaDetail,
  normalizeMediaPageResult,
  normalizeStaffDetail,
} from "@/lib/anilist/domain/types";
import { getDayRangeFromDateKey } from "@/lib/anilist/display/datetime";
import { executeGraphQL } from "@/lib/anilist/infra/graphql-client";
import {
  defineDataFetcher,
  defineGraphQLFetcher,
  defineRuntimeFetcher,
} from "@/lib/anilist/server/cache/define-fetcher";
import { anilistCacheProfiles, mediaPageCacheVars } from "@/lib/anilist/server/cache/policy";
import { buildHomeSectionVariables } from "@/lib/browse/anilist-queries";
import { fetchAllAiringSchedules } from "@/lib/anilist/server/fetch-airing-schedules";

function normalizeGenreCollection(data: {
  GenreCollection?: (string | null)[] | null;
}): GenreOption[] {
  return (data.GenreCollection ?? [])
    .filter((name): name is string => Boolean(name))
    .map((name, index) => ({ id: index, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function normalizeHomeSectionMedia(
  section: HomeSectionId,
  data: {
    Page?: { media?: Parameters<typeof normalizeListedMedia>[0] } | null;
  },
): MediaCard[] {
  const media =
    section === "top100"
      ? normalizeHomeTop100Media(data.Page?.media)
      : normalizeListedMedia(data.Page?.media);

  return section === "airingNow" ? sortMediaByNextAiring(media) : media;
}

export const anilist = {
  genreCollection: defineGraphQLFetcher({
    operationId: "GenreCollection",
    document: GenreCollectionDocument,
    profile: anilistCacheProfiles.genreCollection,
    variables: () => ({}),
    cacheVars: () => ({}),
    normalize: normalizeGenreCollection,
  }),

  homeSection: defineRuntimeFetcher({
    operationId: "HomeSectionMedia",
    profile: anilistCacheProfiles.homeSection,
    runtime: async (section: HomeSectionId) => {
      await connection();
      return {
        section,
        current: getCurrentAnimeSeason(),
        next: getNextAnimeSeason(),
      };
    },
    fetch: async ({ section, current, next }) => {
      const data = await executeGraphQL(
        HomeSectionMediaDocument,
        buildHomeSectionVariables(section, current, next),
      );
      return normalizeHomeSectionMedia(section, data);
    },
  }),

  mediaPage: defineGraphQLFetcher({
    operationId: "MediaPage",
    document: MediaPageDocument,
    profile: anilistCacheProfiles.mediaPage,
    variables: (variables: MediaPageQueryVariables) => variables,
    cacheVars: (variables: MediaPageQueryVariables) => mediaPageCacheVars(variables),
    normalize: normalizeMediaPageResult,
  }),

  mediaDetail: defineGraphQLFetcher({
    operationId: "MediaDetail",
    document: MediaDetailDocument,
    profile: anilistCacheProfiles.mediaDetail,
    variables: (mediaId: number) => ({ id: mediaId }),
    cacheVars: (mediaId: number) => ({ mediaId }),
    normalize: normalizeMediaDetail,
  }),

  characterDetail: defineGraphQLFetcher({
    operationId: "CharacterDetail",
    document: CharacterDetailDocument,
    profile: anilistCacheProfiles.characterDetail,
    variables: (characterId: number) => ({ id: characterId }),
    cacheVars: (characterId: number) => ({ characterId }),
    normalize: normalizeCharacterDetail,
  }),

  staffDetail: defineGraphQLFetcher({
    operationId: "StaffDetail",
    document: StaffDetailDocument,
    profile: anilistCacheProfiles.staffDetail,
    variables: (staffId: number) => ({ id: staffId }),
    cacheVars: (staffId: number) => ({ staffId }),
    normalize: normalizeStaffDetail,
  }),

  mediaCardTooltip: defineGraphQLFetcher({
    operationId: "MediaCardTooltip",
    document: MediaCardTooltipDocument,
    profile: anilistCacheProfiles.tooltip,
    variables: (mediaId: number) => ({ id: mediaId }),
    cacheVars: (mediaId: number) => ({ mediaId }),
    normalize: (data) => data.Media ?? null,
  }),

  airingSchedulesForDay: defineDataFetcher({
    operationId: "AiringSchedules",
    profile: anilistCacheProfiles.airingSchedules,
    cacheVars: (dateKey: string) => {
      const { start, end } = getDayRangeFromDateKey(dateKey);
      return { dateKey, start, end };
    },
    fetch: async (dateKey: string) => {
      const { start, end } = getDayRangeFromDateKey(dateKey);
      return fetchAllAiringSchedules(start, end);
    },
  }),
} as const satisfies Record<
  string,
  | (() => Promise<GenreOption[]>)
  | ((section: HomeSectionId) => Promise<MediaCard[]>)
  | ((variables: MediaPageQueryVariables) => Promise<MediaPageResult>)
  | ((mediaId: number) => Promise<MediaDetail | null>)
  | ((characterId: number) => Promise<CharacterDetail | null>)
  | ((staffId: number) => Promise<StaffDetail | null>)
  | ((mediaId: number) => Promise<MediaCardTooltip | null>)
  | ((dateKey: string) => Promise<AiringScheduleItem[]>)
>;
