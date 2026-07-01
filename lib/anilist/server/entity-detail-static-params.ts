import "server-only";

import type { DetailCategory } from "@/lib/anilist/domain/detail-categories";

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
 * Params for `[category]/[id]/[slug]`.
 *
 * Cache Components requires at least one param at build time to validate the
 * route shape. These are validation samples only, not a content delivery
 * strategy; real detail pages render on demand and use the AniList cache layer.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-static-params
 */
export async function getEntityDetailStaticParams(): Promise<EntityDetailStaticParam[]> {
  return CATEGORY_VALIDATION_SAMPLES;
}
