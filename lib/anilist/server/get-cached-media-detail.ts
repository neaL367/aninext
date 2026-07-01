import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { MediaDetailDocument } from "@/lib/anilist/generated/graphql";
import { executeGraphQL } from "@/lib/anilist/infra/graphql-client";
import { anilistCacheLife } from "@/lib/anilist/server/cache-policy";
import { anilistCacheTags } from "@/lib/anilist/server/cache-tags";
import { normalizeMediaDetail, type MediaDetail } from "@/lib/anilist/domain/types";

/** Cross-request cached media detail — one AniList call per id per cache window. */
export async function getCachedMediaDetail(mediaId: number): Promise<MediaDetail | null> {
  "use cache";

  cacheLife(anilistCacheLife.mediaDetail);
  cacheTag(anilistCacheTags.media);
  cacheTag(anilistCacheTags.mediaDetail(mediaId));

  const data = await executeGraphQL(MediaDetailDocument, { id: mediaId });
  return normalizeMediaDetail(data);
}
