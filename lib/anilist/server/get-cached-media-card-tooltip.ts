import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { MediaCardTooltipDocument } from "@/lib/anilist/generated/graphql";
import { executeGraphQL } from "@/lib/anilist/graphql-client";
import { anilistCacheTags } from "@/lib/anilist/server/cache-tags";
import type { MediaCardTooltip } from "@/lib/anilist/types";

/** Cross-request cached tooltip fields — fetched on card hover only. */
export async function getCachedMediaCardTooltip(
  mediaId: number
): Promise<MediaCardTooltip | null> {
  "use cache";

  cacheLife("hours");
  cacheTag(anilistCacheTags.media);
  cacheTag(anilistCacheTags.mediaDetail(mediaId));

  const data = await executeGraphQL(MediaCardTooltipDocument, { id: mediaId });
  return data.Media ?? null;
}
