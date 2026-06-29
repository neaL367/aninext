import { cacheLife, cacheTag } from "next/cache";
import {
  MediaPageDocument,
  type MediaPageQueryVariables,
} from "@/lib/anilist/generated/graphql";
import { executeGraphQL } from "@/lib/anilist/graphql-client";
import {
  anilistCacheTags,
  mediaPageFilterKey,
} from "@/lib/anilist/server/cache-tags";
import { normalizeMediaPageResult, type MediaPageResult } from "@/lib/anilist/types";

/** Cross-request cached browse page — shared by all users with the same filters. */
export async function getCachedMediaPage(
  variables: MediaPageQueryVariables
): Promise<MediaPageResult> {
  "use cache";

  const page = variables.page ?? 1;
  const filterKey = mediaPageFilterKey(
    variables as Record<string, unknown>
  );

  cacheLife("minutes");
  cacheTag(anilistCacheTags.mediaPages);
  cacheTag(anilistCacheTags.mediaPage(page, filterKey));

  const data = await executeGraphQL(MediaPageDocument, variables);
  return normalizeMediaPageResult(data);
}
