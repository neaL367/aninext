import "server-only";

import { notFound } from "next/navigation";
import { cache } from "react";
import { getMediaDetail } from "@/lib/anilist/server/get-media-detail";

type AnimeDetailParams = Promise<{ id: string }>;

/** Per-request dedupe for parallel detail Suspense boundaries (cover + body). */
export const resolveAnimeDetailMedia = cache(async (params: AnimeDetailParams) => {
  const { id } = await params;
  const mediaId = Number(id);

  if (!Number.isFinite(mediaId)) {
    notFound();
  }

  const media = await getMediaDetail(mediaId);
  if (!media) {
    notFound();
  }

  return media;
});
