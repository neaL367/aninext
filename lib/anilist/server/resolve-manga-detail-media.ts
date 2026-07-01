import "server-only";

import { notFound } from "next/navigation";
import { formatDisplayTitle } from "@/lib/anilist/display/format";
import { createSlugDetailResolver } from "@/lib/anilist/server/create-slug-detail-resolver";
import { getMediaDetail } from "@/lib/anilist/server/get-media-detail";
import { mangaDetailPath } from "@/lib/navigation/detail-paths";

export const resolveMangaDetailMedia = createSlugDetailResolver({
  fetch: getMediaDetail,
  getSlugName: (media) => formatDisplayTitle(media.title),
  getCanonicalPath: (media, slugName) => mangaDetailPath(media.id, slugName),
  beforeCanonicalRedirect: (media) => {
    if (media.type !== "MANGA") {
      notFound();
    }
  },
});
