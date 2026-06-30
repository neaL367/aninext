import "server-only";

import { permanentRedirect } from "next/navigation";
import { notFound } from "next/navigation";
import { cache } from "react";
import { formatDisplayTitle } from "@/lib/anilist/display/format";
import { matchesDetailSlug } from "@/lib/anilist/display/media-links";
import type { SlugDetailParams } from "@/lib/anilist/domain/detail-route-params";
import { getMediaDetail } from "@/lib/anilist/server/get-media-detail";
import { parseDetailId } from "@/lib/anilist/server/parse-detail-id";
import { animeDetailPath, mangaDetailPath } from "@/lib/navigation/detail-paths";

/** Per-request dedupe for parallel detail Suspense boundaries (cover + body). */
export const resolveAnimeDetailMedia = cache(async (params: SlugDetailParams) => {
  const { id, slug } = await params;
  const mediaId = parseDetailId(id);
  const media = await getMediaDetail(mediaId);

  if (!media) {
    notFound();
  }

  const title = formatDisplayTitle(media.title);

  if (media.type === "MANGA") {
    permanentRedirect(mangaDetailPath(media.id, title));
  }

  const canonicalPath = animeDetailPath(media.id, title);

  if (!matchesDetailSlug(title, slug)) {
    permanentRedirect(canonicalPath);
  }

  return media;
});
