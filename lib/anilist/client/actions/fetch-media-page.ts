"use server";

import type { MediaPageQueryVariables } from "@/lib/anilist/generated/graphql";
import { getCachedMediaPage } from "@/lib/anilist/server/get-media-page";
import type { MediaPageResult } from "@/lib/anilist/domain/types";

/** Browse infinite scroll — hits Cache Components layer, not AniList directly per user. */
export async function fetchMediaPageAction(
  variables: MediaPageQueryVariables
): Promise<MediaPageResult> {
  return getCachedMediaPage(variables);
}
