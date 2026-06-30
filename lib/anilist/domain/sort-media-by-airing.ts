import type { MediaCard } from "@/lib/anilist/domain/types";

/** Soonest next episode first; titles without a schedule sink to the end. */
export function sortMediaByNextAiring(media: readonly MediaCard[]): MediaCard[] {
  return [...media].sort((a, b) => {
    const aAt = a.nextAiringEpisode?.airingAt ?? Number.POSITIVE_INFINITY;
    const bAt = b.nextAiringEpisode?.airingAt ?? Number.POSITIVE_INFINITY;
    return aAt - bAt;
  });
}
