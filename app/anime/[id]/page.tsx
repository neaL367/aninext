import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AnimeDetailView } from "@/components/detail/anime-detail-view";
import { AnimeDetailSkeleton } from "@/components/detail/anime-detail-skeleton";
import { getMediaDetail } from "@/lib/anilist/server/get-media-detail";
import {
  formatDisplayTitle,
  stripHtml,
} from "@/lib/anilist/utils/format";
import { createAnimeJsonLd } from "@/lib/seo/json-ld";
import { createDetailMetadata } from "@/lib/seo/metadata";

export const instant = false;

type AnimeDetailPageProps = {
  params: Promise<{ id: string }>;
};

async function AnimeDetailContent({ params }: AnimeDetailPageProps) {
  const { id } = await params;
  const mediaId = Number(id);
  if (!Number.isFinite(mediaId)) {
    notFound();
  }

  const media = await getMediaDetail(mediaId);
  if (!media) {
    notFound();
  }

  const jsonLd = createAnimeJsonLd(media);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AnimeDetailView media={media} />
    </>
  );
}

export async function generateMetadata({ params }: AnimeDetailPageProps) {
  const { id } = await params;
  const mediaId = Number(id);
  if (!Number.isFinite(mediaId)) {
    return createDetailMetadata("Anime not found", "Anime details", mediaId);
  }

  const media = await getMediaDetail(mediaId);
  if (!media) {
    return createDetailMetadata("Anime not found", "Anime details", mediaId);
  }

  return createDetailMetadata(
    formatDisplayTitle(media.title),
    stripHtml(media.description).slice(0, 160),
    media.id
  );
}

export default function AnimeDetailPage({ params }: AnimeDetailPageProps) {
  return (
    <Suspense fallback={<AnimeDetailSkeleton />}>
      <AnimeDetailContent params={params} />
    </Suspense>
  );
}
