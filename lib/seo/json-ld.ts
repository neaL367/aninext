import type { MediaDetail } from "@/lib/anilist/types";
import { formatDisplayTitle, stripHtml } from "@/lib/anilist/utils/format";

export function createAnimeJsonLd(media: MediaDetail) {
  const title = formatDisplayTitle(media.title);
  const description = stripHtml(media.description);

  return {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    name: title,
    description: description === "—" ? undefined : description,
    image: media.coverImage?.large ?? undefined,
    genre: media.genres ?? undefined,
    numberOfEpisodes: media.episodes ?? undefined,
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
