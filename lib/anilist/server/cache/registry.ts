import "server-only";

import { connection } from "next/server";
import {
  CharacterDetailDocument,
  GenreCollectionDocument,
  HomePageSectionsDocument,
  MediaCardTooltipBatchDocument,
  MediaDetailDocument,
  MediaPageDocument,
  StaffDetailDocument,
  type MediaPageQueryVariables,
} from "@/lib/anilist/generated/graphql";
import type { GenreOption } from "@/lib/anilist/domain/genres";
import type { HomePageSections } from "@/lib/anilist/domain/home-page-sections";
import { normalizeHomePageSections } from "@/lib/anilist/domain/normalize-home-page-sections";
import { getCurrentAnimeSeason, getNextAnimeSeason } from "@/lib/anilist/domain/season";
import type {
  AiringScheduleItem,
  CharacterDetail,
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
import {
  buildMediaCardTooltipBatchVariables,
  normalizeMediaCardTooltipBatch,
  tooltipBatchIdsKey,
} from "@/lib/anilist/domain/tooltip-batch";
import { executeGraphQL } from "@/lib/anilist/infra/graphql-client";
import {
  defineDataFetcher,
  defineGraphQLFetcher,
  defineRuntimeFetcher,
} from "@/lib/anilist/server/cache/define-fetcher";
import {
  anilistCacheProfiles,
  mediaPageCacheVars,
  mediaPageProfileFor,
} from "@/lib/anilist/server/cache/policy";
import { buildHomePageSectionVariables } from "@/lib/browse/anilist-queries";
import { fetchAllAiringSchedules } from "@/lib/anilist/server/fetch-airing-schedules";
import { fetchAiringScheduleCount } from "@/lib/anilist/server/fetch-airing-schedule-count";

function normalizeGenreCollection(data: {
  GenreCollection?: (string | null)[] | null;
}): GenreOption[] {
  return (data.GenreCollection ?? [])
    .filter((name): name is string => Boolean(name))
    .map((name, index) => ({ id: index, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
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

  homePageSections: defineRuntimeFetcher({
    operationId: "HomePageSections",
    profile: anilistCacheProfiles.homePageSections,
    runtime: async () => {
      await connection();
      return {
        current: getCurrentAnimeSeason(),
        next: getNextAnimeSeason(),
      };
    },
    fetch: async ({ current, next }) => {
      const data = await executeGraphQL(
        HomePageSectionsDocument,
        buildHomePageSectionVariables(current, next),
      );
      return normalizeHomePageSections(data);
    },
  }),

  mediaPage: defineGraphQLFetcher({
    operationId: "MediaPage",
    document: MediaPageDocument,
    profile: anilistCacheProfiles.mediaPage,
    resolveProfile: mediaPageProfileFor,
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

  mediaCardTooltipBatch: defineDataFetcher({
    operationId: "MediaCardTooltipBatch",
    profile: anilistCacheProfiles.tooltipBatch,
    cacheVars: (mediaIds: number[]) => ({ idsKey: tooltipBatchIdsKey(mediaIds) }),
    fetch: async (mediaIds: number[]) => {
      const data = await executeGraphQL(
        MediaCardTooltipBatchDocument,
        buildMediaCardTooltipBatchVariables(mediaIds),
      );
      return normalizeMediaCardTooltipBatch(mediaIds, data);
    },
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

  airingScheduleCountForDay: defineDataFetcher({
    operationId: "AiringScheduleCount",
    profile: anilistCacheProfiles.airingScheduleCount,
    cacheVars: (dateKey: string) => {
      const { start, end } = getDayRangeFromDateKey(dateKey);
      return { dateKey, start, end };
    },
    fetch: async (dateKey: string) => {
      const { start, end } = getDayRangeFromDateKey(dateKey);
      return fetchAiringScheduleCount(start, end);
    },
  }),
} as const satisfies Record<
  string,
  | (() => Promise<GenreOption[]>)
  | (() => Promise<HomePageSections>)
  | ((variables: MediaPageQueryVariables) => Promise<MediaPageResult>)
  | ((mediaId: number) => Promise<MediaDetail | null>)
  | ((characterId: number) => Promise<CharacterDetail | null>)
  | ((staffId: number) => Promise<StaffDetail | null>)
  | ((mediaIds: number[]) => Promise<Map<number, MediaCardTooltip | null>>)
  | ((dateKey: string) => Promise<AiringScheduleItem[]>)
  | ((dateKey: string) => Promise<number>)
>;
