import type { MediaType } from "@/lib/anilist/domain/types";

export function getAnilistMediaSiteUrl(
  mediaId: number,
  type: MediaType | null | undefined
): string {
  const segment = type === "MANGA" ? "manga" : "anime";
  return `https://anilist.co/${segment}/${mediaId}`;
}

export function getMediaDetailHref(
  mediaId: number,
  type: MediaType | null | undefined
): { href: string; external: boolean } {
  if (type === "ANIME" || type == null) {
    return { href: `/anime/${mediaId}`, external: false };
  }

  return {
    href: getAnilistMediaSiteUrl(mediaId, type),
    external: true,
  };
}
