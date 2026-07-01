import type { MediaCard } from "@/lib/anilist/domain/types";

export function sortMediaByScore<T extends { averageScore?: number | null }>(
  items: readonly T[],
): T[] {
  return [...items].sort((a, b) => (b.averageScore ?? 0) - (a.averageScore ?? 0));
}

export function withTop100Ranks<T extends MediaCard>(
  items: readonly T[],
): (T & { rank: number })[] {
  return sortMediaByScore(items).map((item, index) => ({
    ...item,
    rank: index + 1,
  }));
}
