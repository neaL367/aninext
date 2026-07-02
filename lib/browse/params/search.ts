/** Minimum non-empty search length before prefetching or querying AniList. */
export const MIN_BROWSE_SEARCH_LENGTH = 2;

export function normalizeSearchQuery(q: string): string {
  return q.trim().replace(/\s+/g, " ");
}

export function shouldPrefetchBrowseSearch(q: string): boolean {
  const normalized = normalizeSearchQuery(q);
  return normalized.length === 0 || normalized.length >= MIN_BROWSE_SEARCH_LENGTH;
}
