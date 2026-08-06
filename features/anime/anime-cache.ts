export const ANIME_CACHE = {
  genres: "anime:genres" as const,
  browseCollection: (collection: string, hash: string) =>
    `anime:browse:${collection}:${hash}` as const,
  detail: (id: number) => `anime:detail:${id}` as const,
  airingSchedule: (id: number) => `anime:sub:${id}:airing` as const,
  airingDay: (date: string) => `anime:airing:day:${date}` as const,
  airingWeek: (monday: string) => `anime:airing:week:${monday}` as const,
} as const;
