import "server-only";

import type { DetailCategory } from "@/lib/anilist/domain/detail-categories";
import { formatDisplayTitle } from "@/lib/anilist/display/format";
import { getHomeSectionMediaForStaticGeneration } from "@/lib/anilist/server/get-home-sections";
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

function mediaToStaticParam(media: {
  id: number;
  type?: string | null;
  title: Parameters<typeof formatDisplayTitle>[0];
}): EntityDetailStaticParam {
  const category: DetailCategory = media.type === "MANGA" ? "manga" : "anime";
  const title = formatDisplayTitle(media.title);

  return {
    category,
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
 * With Cache Components enabled, this must return at least one entry — an empty
 * array fails the build. We pre-render trending anime/manga at build time and
 * keep one sample per category so all route shapes are validated.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-static-params
 */
export async function getEntityDetailStaticParams(): Promise<EntityDetailStaticParam[]> {
  const trending = await getHomeSectionMediaForStaticGeneration("trending");
  const fromTrending = trending.map(mediaToStaticParam);

  if (!fromTrending.length) {
    return CATEGORY_VALIDATION_SAMPLES;
  }

  return dedupeStaticParams([...fromTrending, ...CATEGORY_VALIDATION_SAMPLES]);
}
