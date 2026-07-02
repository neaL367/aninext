import { anilistCacheProfiles } from "@/lib/anilist/server/cache/policy";

/**
 * L3 ISR for detail routes.
 * `app/[category]/[id]/[slug]/page.tsx` must export the same numeric literal
 * because Next.js requires a statically analyzable `revalidate` value.
 */
export const detailRouteRevalidate = anilistCacheProfiles.mediaDetail.revalidate;
