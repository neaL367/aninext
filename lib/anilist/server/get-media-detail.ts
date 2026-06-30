import "server-only";

import { cache } from "react";
import { getCachedMediaDetail } from "@/lib/anilist/server/get-cached-media-detail";

/** Per-request dedupe (page + generateMetadata) atop cross-request cache. */
export const getMediaDetail = cache(async (mediaId: number) => {
  return getCachedMediaDetail(mediaId);
});
