import "server-only";

import type { DetailCategory } from "@/lib/anilist/domain/detail-categories";
import { formatDisplayTitle } from "@/lib/anilist/display/format";
import { getTrendingAnimeForStaticGeneration } from "@/lib/anilist/server/get-home-sections";
import { buildDetailSlug } from "@/lib/navigation/detail-paths";

export type EntityDetailStaticParam = {
  category: DetailCategory;
  id: string;
  slug: string;
};

/** Minimum samples so Cache Components validates every detail category at build time. */
const CATEGORY_VALIDATION_SAMPLES: EntityDetailStaticParam[] = [
  { category: "anime", id: "21", slug: "One-Piece" },
  { category: "character", id: "40", slug: "Monkey-D-Luffy" },
  { category: "manga", id: "30013", slug: "One-Piece" },
  { category: "staff", id: "96893", slug: "Eiichiro-Oda" },
];

/**
 * Trending anime titles get the most detail-page traffic, so pre-rendering them
 * means those visits are served from the static/ISR cache instead of hitting
 * AniList on a cold request. Keep this bounded — every extra entry adds a
 * build task.
 */
const TRENDING_ANIME_PRERENDER_COUNT = 12;

function mediaToStaticParam(media: {
  id: number;
  title: Parameters<typeof formatDisplayTitle>[0];
}): EntityDetailStaticParam {
  const title = formatDisplayTitle(media.title);

  return {
    category: "anime",
    id: String(media.id),
    slug: buildDetailSlug(title),
  };
}

function dedupeStaticParams(params: EntityDetailStaticParam[]): EntityDetailStaticParam[] {
  const seen = new Set<string>();

  return params.filter((param) => {
    const key = `${param.category}/${param.id}`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

/**
 * Params for `[category]/[id]/[slug]`.
 *
 * Cache Components requires at least one param at build time to validate the
 * route shape, so we always keep one sample per category. On top of that we
 * pre-render trending anime, since those pages get the most traffic — other
 * detail URLs still render on demand at request time (ISR fallback) and are
 * cached for subsequent visitors.
 *
 * Falls back to the category samples alone if AniList is unavailable (e.g.
 * rate-limited) during the build, so a flaky upstream never fails the build.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-static-params
 */
export async function getEntityDetailStaticParams(): Promise<EntityDetailStaticParam[]> {
  try {
    const trending = await getTrendingAnimeForStaticGeneration(TRENDING_ANIME_PRERENDER_COUNT);
    const fromTrending = trending.map(mediaToStaticParam);

    if (!fromTrending.length) {
      return CATEGORY_VALIDATION_SAMPLES;
    }

    return dedupeStaticParams([...fromTrending, ...CATEGORY_VALIDATION_SAMPLES]);
  } catch {
    return CATEGORY_VALIDATION_SAMPLES;
  }
}
