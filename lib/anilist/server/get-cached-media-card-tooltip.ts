import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { MediaCardTooltipDocument } from "@/lib/anilist/generated/graphql";
import { executeGraphQL } from "@/lib/anilist/infra/graphql-client";
import { anilistCacheLife } from "@/lib/anilist/server/cache-policy";
import { anilistCacheTags } from "@/lib/anilist/server/cache-tags";
import type { MediaCardTooltip } from "@/lib/anilist/domain/types";

/** Cross-request cached tooltip fields — fetched on card hover only. */
export async function getCachedMediaCardTooltip(
  mediaId: number
): Promise<MediaCardTooltip | null> {
  "use cache";

  cacheLife(anilistCacheLife.tooltip);
  cacheTag(anilistCacheTags.media);
  cacheTag(anilistCacheTags.mediaDetail(mediaId));

  const data = await executeGraphQL(MediaCardTooltipDocument, { id: mediaId });
  return data.Media ?? null;
}
