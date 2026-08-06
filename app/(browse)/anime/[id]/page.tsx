import { Suspense } from "react";
import type { Metadata } from "next";
import { ErrorBoundary } from "@/components/error-boundary";
import { DetailSection, DetailSectionSkeleton } from "@/features/anime/components/detail/detail-section";
import { getAnimeDetail } from "@/features/anime/anime-queries";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const detail = await getAnimeDetail(Number(id));
    const media = detail.media;
    if (!media) return {};
    const title = media.title.english ?? media.title.romaji ?? "Unknown";
    const description = media.description?.replace(/<[^>]*>/g, "").slice(0, 160) ?? "";
    return {
      title,
      description,
      openGraph: { title, description, images: media.bannerImage ? [{ url: media.bannerImage }] : [] },
      alternates: { canonical: `/anime/${id}` },
    };
  } catch {
    return {};
  }
}

export default function AnimeDetailPage({ params }: PageProps<"/anime/[id]">) {
  return (
    <ErrorBoundary title="Anime details failed to load">
      <Suspense fallback={<DetailSectionSkeleton />}>
        {params.then(({ id }) => (
          <DetailSection id={Number(id)} />
        ))}
      </Suspense>
    </ErrorBoundary>
  );
}
