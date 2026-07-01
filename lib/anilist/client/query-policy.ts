/** React Query freshness for AniList client caches. */
export const anilistQueryStaleTime = {
  mediaPage: 5 * 60 * 1000,
  tooltip: 5 * 60 * 1000,
} as const;

export const anilistQueryGcTime = {
  mediaPage: 15 * 60 * 1000,
  tooltip: 30 * 60 * 1000,
} as const;
