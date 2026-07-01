import "server-only";

import { notFound, permanentRedirect } from "next/navigation";
import { formatDisplayTitle } from "@/lib/anilist/display/format";
import { createSlugDetailResolver } from "@/lib/anilist/server/create-slug-detail-resolver";
import { getMediaDetail } from "@/lib/anilist/server/get-media-detail";
import { animeDetailPath, mangaDetailPath } from "@/lib/navigation/detail-paths";

/** Per-request dedupe for parallel detail Suspense boundaries (cover + body). */
export const resolveAnimeDetailMedia = createSlugDetailResolver({
  fetch: getMediaDetail,
  getSlugName: (media) => formatDisplayTitle(media.title),
  getCanonicalPath: (media, slugName) => animeDetailPath(media.id, slugName),
  beforeCanonicalRedirect: (media) => {
    if (media.type === "MANGA") {
      permanentRedirect(
        mangaDetailPath(media.id, formatDisplayTitle(media.title))
      );
    }
  },
});
