import { cacheLife, cacheTag } from "next/cache";
import { MediaDetailDocument } from "@/lib/anilist/generated/graphql";
import { executeGraphQL } from "@/lib/anilist/graphql-client";
import { anilistCacheTags } from "@/lib/anilist/server/cache-tags";
import { normalizeMediaDetail, type MediaDetail } from "@/lib/anilist/types";

/** Cross-request cached media detail — one AniList call per id per cache window. */
export async function getCachedMediaDetail(
  mediaId: number
): Promise<MediaDetail | null> {
  "use cache";

  cacheLife("hours");
  cacheTag(anilistCacheTags.media);
  cacheTag(anilistCacheTags.mediaDetail(mediaId));

  const data = await executeGraphQL(MediaDetailDocument, { id: mediaId });
  return normalizeMediaDetail(data);
}
