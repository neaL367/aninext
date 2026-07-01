/** AniList CDN path size tiers (low → high). */
export const ANILIST_IMAGE_SIZE_ORDER = ["small", "medium", "large", "extraLarge"] as const;

export type AnilistImageSize = (typeof ANILIST_IMAGE_SIZE_ORDER)[number];

const SIZE_SEGMENT = /\/(extraLarge|large|medium|small)(?=\/)/;

export function isAnilistCdnUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    return new URL(url).hostname.endsWith("anilist.co");
  } catch {
    return false;
  }
}

export function resizeAnilistImageUrl(url: string, size: AnilistImageSize): string {
  if (!isAnilistCdnUrl(url)) return url;
  if (SIZE_SEGMENT.test(url)) {
    return url.replace(SIZE_SEGMENT, `/${size}`);
  }
  return url;
}

function uniqueSources(urls: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const url of urls) {
    if (!url || seen.has(url)) continue;
    seen.add(url);
    result.push(url);
  }
  return result;
}

type CoverLike = {
  medium?: string | null;
  large?: string | null;
  extraLarge?: string | null;
};

/** Build low → medium → high → large source list for progressive loading. */
export function buildProgressiveImageSources(
  input: string | CoverLike | null | undefined,
): string[] {
  if (!input) return [];

  const base =
    typeof input === "string" ? input : (input.large ?? input.extraLarge ?? input.medium);

  if (!base) return [];

  if (!isAnilistCdnUrl(base)) {
    return [base];
  }

  const cover = typeof input === "string" ? null : input;

  return uniqueSources([
    resizeAnilistImageUrl(base, "small"),
    cover?.medium ?? resizeAnilistImageUrl(base, "medium"),
    cover?.large ?? resizeAnilistImageUrl(base, "large"),
    cover?.extraLarge ?? resizeAnilistImageUrl(base, "extraLarge"),
  ]);
}

export function coverProgressiveSources(cover: CoverLike | null | undefined): string[] {
  if (!cover) return [];
  return buildProgressiveImageSources(cover);
}

/** Single medium cover for dense grids — avoids progressive swaps during scroll. */
export function coverCardImageUrl(cover: CoverLike | null | undefined): string | null {
  if (!cover) return null;

  const base = cover.large ?? cover.extraLarge ?? cover.medium;
  if (!base) return null;

  if (!isAnilistCdnUrl(base)) return base;
  return resizeAnilistImageUrl(base, "medium");
}
