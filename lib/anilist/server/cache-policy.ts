/**
 * Cache lifetime profiles for AniList data, keyed by content type.
 *
 * Each value names a custom `cacheLife` profile registered in `next.config.ts`
 * (see the `cacheLife` block there for the actual stale/revalidate/expire
 * numbers). Keeping the profile definitions in one place makes the tradeoffs
 * explicit: how fast content can go stale vs. how often we hit AniList.
 */
export const anilistCacheLife = {
  airingSchedules: "anilistAiringSchedule",
  genreCollection: "anilistGenres",
  homeSection: "anilistHomeSection",
  mediaDetail: "anilistMediaDetail",
  characterDetail: "anilistPersonDetail",
  staffDetail: "anilistPersonDetail",
  mediaPage: "anilistMediaPage",
  tooltip: "anilistTooltip",
} as const;
