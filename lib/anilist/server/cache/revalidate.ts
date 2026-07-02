import "server-only";

import { revalidateTag } from "next/cache";
import { anilistCacheTags } from "@/lib/anilist/server/cache/tags";

const REVALIDATE_PROFILE = "max" as const;

export function revalidateAllAnilistGenres(): void {
  revalidateTag(anilistCacheTags.genres, REVALIDATE_PROFILE);
}

export function revalidateAllAnilistMedia(): void {
  revalidateTag(anilistCacheTags.media, REVALIDATE_PROFILE);
}

export function revalidateAnilistMediaDetail(id: number): void {
  revalidateTag(anilistCacheTags.mediaDetail(id), REVALIDATE_PROFILE);
}

export function revalidateAnilistCharacterDetail(id: number): void {
  revalidateTag(anilistCacheTags.characterDetail(id), REVALIDATE_PROFILE);
}

export function revalidateAnilistStaffDetail(id: number): void {
  revalidateTag(anilistCacheTags.staffDetail(id), REVALIDATE_PROFILE);
}

export function revalidateAllAnilistMediaPages(): void {
  revalidateTag(anilistCacheTags.mediaPages, REVALIDATE_PROFILE);
}

export function revalidateAnilistMediaPage(page: number, filterKey: string): void {
  revalidateTag(anilistCacheTags.mediaPage(page, filterKey), REVALIDATE_PROFILE);
}

export function revalidateAllAnilistAiring(): void {
  revalidateTag(anilistCacheTags.airing, REVALIDATE_PROFILE);
}

export function revalidateAnilistAiringDay(dateKey: string): void {
  revalidateTag(anilistCacheTags.airingDay(dateKey), REVALIDATE_PROFILE);
}
