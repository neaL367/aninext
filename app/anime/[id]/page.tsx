import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AnimeDetailView } from "@/components/detail/anime-detail-view";
import { AnimeDetailSkeleton } from "@/components/detail/anime-detail-skeleton";
import { getMediaDetail } from "@/lib/anilist/server/get-media-detail";
import { createAnimeJsonLd } from "@/lib/seo/json-ld";

export const instant = false;

export const metadata: Metadata = {
  title: "Anime",
  description: "Anime details on AniNext.",
};

type AnimeDetailPageProps = {
  params: Promise<{ id: string }>;
};

/** Build-time sample for Cache Components validation (One Piece). */
export async function generateStaticParams() {
  return [{ id: "21" }];
}

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

export default function AnimeDetailPage({ params }: AnimeDetailPageProps) {
  return (
    <Suspense fallback={<AnimeDetailSkeleton />}>
      <AnimeDetailContent params={params} />
    </Suspense>
  );
}
