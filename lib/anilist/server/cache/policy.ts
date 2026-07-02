import type { HomeSectionId } from "@/lib/anilist/domain/home-sections";
import type { AnimeSeason } from "@/lib/anilist/domain/season";
import { anilistCacheTags, mediaPageFilterKey } from "@/lib/anilist/server/cache/tags";
import type { MediaPageQueryVariables } from "@/lib/anilist/generated/graphql";

/** Bump when normalization shapes change to bust all L2 cache entries. */
export const ANILIST_CACHE_VERSION = "1" as const;

export type AnilistCacheProfileId =
  | "genreCollection"
  | "homeSection"
  | "mediaPage"
  | "mediaDetail"
  | "characterDetail"
  | "staffDetail"
  | "tooltip"
  | "airingSchedules";

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

export type HomeSectionCacheVars = {
  section: HomeSectionId;
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

  homeSection: {
    revalidate: SECONDS.fiveMinutes,
    namespace: "home-section",
    keyParts: (vars) => [
      vars.section,
      vars.current.season,
      String(vars.current.year),
      vars.next.season,
      String(vars.next.year),
    ],
    tags: (vars) => [
      anilistCacheTags.homeSection(
        vars.section,
        vars.current.season,
        vars.current.year,
        vars.next.season,
        vars.next.year,
      ),
    ],
  } satisfies AnilistCacheProfile<HomeSectionCacheVars>,

  mediaPage: {
    revalidate: SECONDS.fiveMinutes,
    namespace: "media-page",
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

  tooltip: {
    revalidate: SECONDS.fiveMinutes,
    namespace: "media-tooltip",
    keyParts: (vars) => [String(vars.mediaId)],
    tags: (vars) => [anilistCacheTags.media, anilistCacheTags.mediaDetail(vars.mediaId)],
  } satisfies AnilistCacheProfile<MediaIdCacheVars>,

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
} as const;

/** GraphQL operation name → cache profile (compile-time guard for new operations). */
export const profilesByOperation = {
  GenreCollection: anilistCacheProfiles.genreCollection,
  HomeSectionMedia: anilistCacheProfiles.homeSection,
  MediaPage: anilistCacheProfiles.mediaPage,
  MediaDetail: anilistCacheProfiles.mediaDetail,
  CharacterDetail: anilistCacheProfiles.characterDetail,
  StaffDetail: anilistCacheProfiles.staffDetail,
  MediaCardTooltip: anilistCacheProfiles.tooltip,
} as const;

export type AnilistGraphQLOperationName = keyof typeof profilesByOperation;

export function mediaPageCacheVars(variables: MediaPageQueryVariables): MediaPageCacheVars {
  return {
    ...variables,
    filterKey: mediaPageFilterKey(variables as Record<string, unknown>),
  };
}
