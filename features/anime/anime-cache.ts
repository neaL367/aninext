export const ANIME_CACHE = {
  genres: "anime:genres" as const,
  browseCollection: (collection: string, hash: string) =>
    `anime:browse:${collection}:${hash}` as const,
  detail: (id: number) => `anime:detail:${id}` as const,
  characters: (id: number) => `anime:characters:${id}` as const,
  staff: (id: number) => `anime:staff:${id}` as const,
  subSection: (
    id: number,
    section: "relations" | "recs" | "reviews" | "airing"
  ) => `anime:sub:${id}:${section}` as const,
  airingDay: (date: string) => `anime:airing:day:${date}` as const,
  airingWeek: (monday: string) => `anime:airing:week:${monday}` as const,
} as const;
