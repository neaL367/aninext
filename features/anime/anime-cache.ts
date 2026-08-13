export const ANIME_CACHE = {
  genres: "anime:genres" as const,
  browseCollection: (collection: string, hash: string) =>
    `anime:browse:${collection}:${hash}` as const,
  detail: (id: number) => `anime:detail:${id}` as const,
  characters: (id: number) => `anime:characters:${id}` as const,
  staff: (id: number) => `anime:staff:${id}` as const,
  subSection: (id: number, section: "relations" | "recs" | "airing") =>
    `anime:sub:${id}:${section}` as const,
  airingDay: (date: string, windowStart: number) =>
    `anime:airing:day:${date}:${windowStart}` as const,
} as const;
