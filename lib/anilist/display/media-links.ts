import type { Route } from "next";
import {
  animeDetailPath,
  buildDetailSlug,
  characterDetailPath,
  mangaDetailPath,
  staffDetailPath,
} from "@/lib/navigation/detail-paths";
import type { MediaType } from "@/lib/anilist/domain/types";

export function getAnilistMediaSiteUrl(
  mediaId: number,
  type: MediaType | null | undefined,
): string {
  const segment = type === "MANGA" ? "manga" : "anime";
  return `https://anilist.co/${segment}/${mediaId}`;
}

export function getMediaDetailHref(
  mediaId: number,
  type: MediaType | null | undefined,
  title?: string | null,
): { href: Route | string; external: boolean } {
  const displayTitle = title?.trim() || "unknown";

  if (type === "MANGA") {
    return {
      href: mangaDetailPath(mediaId, displayTitle),
      external: false,
    };
  }

  if (type === "ANIME" || type == null) {
    return {
      href: animeDetailPath(mediaId, displayTitle),
      external: false,
    };
  }

  return {
    href: getAnilistMediaSiteUrl(mediaId, type),
    external: true,
  };
}

export function getCharacterDetailHref(characterId: number, name: string): Route {
  return characterDetailPath(characterId, name);
}

export function getStaffDetailHref(staffId: number, name: string): Route {
  return staffDetailPath(staffId, name);
}

export function matchesDetailSlug(name: string, slug: string): boolean {
  return buildDetailSlug(name) === slug;
}
