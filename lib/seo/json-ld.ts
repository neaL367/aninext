import type { MediaDetail } from "@/lib/anilist/domain/types";
import { formatDisplayTitle, stripHtml } from "@/lib/anilist/display/format";

export function createMediaJsonLd(media: MediaDetail) {
  const title = formatDisplayTitle(media.title);
  const description = stripHtml(media.description);
  const isManga = media.type === "MANGA";

  return {
    "@context": "https://schema.org",
    "@type": isManga ? "ComicSeries" : "TVSeries",
    name: title,
    description: description === "—" ? undefined : description,
    image: media.coverImage?.large ?? undefined,
    genre: media.genres ?? undefined,
    ...(isManga
      ? {
          numberOfVolumes: media.volumes ?? undefined,
          numberOfItems: media.chapters ?? undefined,
        }
      : {
          numberOfEpisodes: media.episodes ?? undefined,
        }),
    aggregateRating:
      media.averageScore !== null
        ? {
            "@type": "AggregateRating",
            ratingValue: media.averageScore / 10,
            bestRating: 10,
            worstRating: 1,
          }
        : undefined,
  };
}
