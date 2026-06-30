"use server";

import { getCachedMediaCardTooltip } from "@/lib/anilist/server/get-cached-media-card-tooltip";
import type { MediaCardTooltip } from "@/lib/anilist/domain/types";

export async function fetchMediaCardTooltipAction(
  mediaId: number
): Promise<MediaCardTooltip | null> {
  return getCachedMediaCardTooltip(mediaId);
}
