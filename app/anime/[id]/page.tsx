import { permanentRedirect } from "next/navigation";
import { notFound } from "next/navigation";
import { formatDisplayTitle } from "@/lib/anilist/display/format";
import { getMediaDetail } from "@/lib/anilist/server/get-media-detail";
import { parseDetailId } from "@/lib/anilist/server/parse-detail-id";
import { animeDetailPath, mangaDetailPath } from "@/lib/navigation/detail-paths";

type LegacyAnimeDetailRedirectProps = {
  params: Promise<{ id: string }>;
};

/** Redirect legacy `/anime/[id]` URLs to the slugged detail route. */
export default async function LegacyAnimeDetailRedirect({
  params,
}: LegacyAnimeDetailRedirectProps) {
  const { id } = await params;
  const mediaId = parseDetailId(id);
  const media = await getMediaDetail(mediaId);

  if (!media) {
    notFound();
  }

  const title = formatDisplayTitle(media.title);
  const path =
    media.type === "MANGA"
      ? mangaDetailPath(media.id, title)
      : animeDetailPath(media.id, title);

  permanentRedirect(path);
}
