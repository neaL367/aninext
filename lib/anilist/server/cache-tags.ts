/** Shared cache tag namespaces for AniList data (use with cacheTag). */
export const anilistCacheTags = {
  genres: "anilist-genres",
  homeSection: (
    section: string,
    currentSeason: string,
    currentYear: number,
    nextSeason: string,
    nextYear: number
  ) =>
    `anilist-home-${section}-${currentSeason}-${currentYear}-${nextSeason}-${nextYear}`,
  media: "anilist-media",
  mediaDetail: (id: number) => `anilist-media-${id}`,
  characterDetail: (id: number) => `anilist-character-${id}`,
  staffDetail: (id: number) => `anilist-staff-${id}`,
  mediaPages: "anilist-media-pages",
  mediaPage: (page: number, filterKey: string) =>
    `anilist-media-page-${filterKey}-p${page}`,
  airing: "anilist-airing",
  airingDay: (dateKey: string) => `anilist-airing-day-${dateKey}`,
  airingRange: (start: number, end: number) => `anilist-airing-${start}-${end}`,
} as const;

/** Stable string for MediaPage filter variables (cache tags). */
export function mediaPageFilterKey(
  variables: Record<string, unknown>
): string {
  const filter = { ...variables };
  delete filter.page;
  delete filter.perPage;
  return JSON.stringify(filter, Object.keys(filter).sort());
}
