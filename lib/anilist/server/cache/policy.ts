import type { AnimeSeason } from "@/lib/anilist/domain/season";
import type { TooltipBatchCacheVars } from "@/lib/anilist/domain/tooltip-batch";
import { anilistCacheTags, mediaPageFilterKey } from "@/lib/anilist/server/cache/tags";
import type { MediaPageQueryVariables } from "@/lib/anilist/generated/graphql";

/** Bump when normalization shapes change to bust all L2 cache entries. */
export const ANILIST_CACHE_VERSION = "4" as const;

export type AnilistCacheProfileId =
  | "genreCollection"
  | "homePageSections"
  | "mediaPage"
  | "mediaPageSearch"
  | "mediaDetail"
  | "characterDetail"
  | "staffDetail"
  | "tooltipBatch"
  | "airingSchedules"
  | "airingScheduleCount";

export type AnilistCacheProfile<TVars> = {
  revalidate: number;
  namespace: string;
  keyParts: (vars: TVars) => string[];
  tags: (vars: TVars) => string[];
};

const SECONDS = {
  fiveMinutes: 60 * 5,
  tenMinutes: 60 * 10,
  fifteenMinutes: 60 * 15,
  oneDay: 60 * 60 * 24,
  threeDays: 60 * 60 * 24 * 3,
  sevenDays: 60 * 60 * 24 * 7,
} as const;

export type HomePageSectionsCacheVars = {
  current: AnimeSeason;
  next: AnimeSeason;
};

export type MediaPageCacheVars = MediaPageQueryVariables & {
  filterKey: string;
};

export type MediaIdCacheVars = { mediaId: number };

export type CharacterIdCacheVars = { characterId: number };

export type StaffIdCacheVars = { staffId: number };

export type AiringSchedulesCacheVars = {
  dateKey: string;
  start: number;
  end: number;
};

export const anilistCacheProfiles = {
  genreCollection: {
    revalidate: SECONDS.sevenDays,
    namespace: "genre-collection",
    keyParts: () => [],
    tags: () => [anilistCacheTags.genres],
  } satisfies AnilistCacheProfile<Record<string, never>>,

  homePageSections: {
    revalidate: SECONDS.tenMinutes,
    namespace: "home-page-sections",
    keyParts: (vars) => [
      vars.current.season,
      String(vars.current.year),
      vars.next.season,
      String(vars.next.year),
    ],
    tags: (vars) => [
      anilistCacheTags.homePage(
        vars.current.season,
        vars.current.year,
        vars.next.season,
        vars.next.year,
      ),
    ],
  } satisfies AnilistCacheProfile<HomePageSectionsCacheVars>,

  mediaPage: {
    revalidate: SECONDS.fiveMinutes,
    namespace: "media-page",
    keyParts: (vars) => [String(vars.page ?? 1), vars.filterKey],
    tags: (vars) => [
      anilistCacheTags.mediaPages,
      anilistCacheTags.mediaPage(vars.page ?? 1, vars.filterKey),
    ],
  } satisfies AnilistCacheProfile<MediaPageCacheVars>,

  mediaPageSearch: {
    revalidate: SECONDS.tenMinutes,
    namespace: "media-page-search",
    keyParts: (vars) => [String(vars.page ?? 1), vars.filterKey],
    tags: (vars) => [
      anilistCacheTags.mediaPages,
      anilistCacheTags.mediaPage(vars.page ?? 1, vars.filterKey),
    ],
  } satisfies AnilistCacheProfile<MediaPageCacheVars>,

  mediaDetail: {
    revalidate: SECONDS.tenMinutes,
    namespace: "media-detail",
    keyParts: (vars) => [String(vars.mediaId)],
    tags: (vars) => [anilistCacheTags.media, anilistCacheTags.mediaDetail(vars.mediaId)],
  } satisfies AnilistCacheProfile<MediaIdCacheVars>,

  characterDetail: {
    revalidate: SECONDS.threeDays,
    namespace: "character-detail",
    keyParts: (vars) => [String(vars.characterId)],
    tags: (vars) => [anilistCacheTags.characterDetail(vars.characterId)],
  } satisfies AnilistCacheProfile<CharacterIdCacheVars>,

  staffDetail: {
    revalidate: SECONDS.threeDays,
    namespace: "staff-detail",
    keyParts: (vars) => [String(vars.staffId)],
    tags: (vars) => [anilistCacheTags.staffDetail(vars.staffId)],
  } satisfies AnilistCacheProfile<StaffIdCacheVars>,

  tooltipBatch: {
    revalidate: SECONDS.fiveMinutes,
    namespace: "media-tooltip-batch",
    keyParts: (vars) => [vars.idsKey],
    tags: (vars) => {
      const mediaIds = vars.idsKey
        .split(",")
        .filter(Boolean)
        .map((id) => Number(id));

      return [
        anilistCacheTags.media,
        ...mediaIds.map((mediaId) => anilistCacheTags.mediaDetail(mediaId)),
      ];
    },
  } satisfies AnilistCacheProfile<TooltipBatchCacheVars>,

  airingSchedules: {
    revalidate: SECONDS.fifteenMinutes,
    namespace: "airing-schedules",
    keyParts: (vars) => [vars.dateKey, String(vars.start), String(vars.end)],
    tags: (vars) => [
      anilistCacheTags.airing,
      anilistCacheTags.airingDay(vars.dateKey),
      anilistCacheTags.airingRange(vars.start, vars.end),
    ],
  } satisfies AnilistCacheProfile<AiringSchedulesCacheVars>,

  airingScheduleCount: {
    revalidate: SECONDS.fifteenMinutes,
    namespace: "airing-schedule-count",
    keyParts: (vars) => [vars.dateKey, String(vars.start), String(vars.end)],
    tags: (vars) => [
      anilistCacheTags.airing,
      anilistCacheTags.airingDay(vars.dateKey),
      anilistCacheTags.airingRange(vars.start, vars.end),
    ],
  } satisfies AnilistCacheProfile<AiringSchedulesCacheVars>,
} as const;

/** GraphQL operation name → cache profile (compile-time guard for new operations). */
export const profilesByOperation = {
  GenreCollection: anilistCacheProfiles.genreCollection,
  HomePageSections: anilistCacheProfiles.homePageSections,
  MediaPage: anilistCacheProfiles.mediaPage,
  MediaDetail: anilistCacheProfiles.mediaDetail,
  CharacterDetail: anilistCacheProfiles.characterDetail,
  StaffDetail: anilistCacheProfiles.staffDetail,
  MediaCardTooltipBatch: anilistCacheProfiles.tooltipBatch,
} as const;

export type AnilistGraphQLOperationName = keyof typeof profilesByOperation;

export function mediaPageCacheVars(variables: MediaPageQueryVariables): MediaPageCacheVars {
  return {
    ...variables,
    filterKey: mediaPageFilterKey(variables as Record<string, unknown>),
  };
}

export function mediaPageProfileFor(
  cacheVars: MediaPageCacheVars,
): AnilistCacheProfile<MediaPageCacheVars> {
  return cacheVars.search?.trim()
    ? anilistCacheProfiles.mediaPageSearch
    : anilistCacheProfiles.mediaPage;
}
