import { Suspense } from "react";

import { ErrorBoundary } from "@/components/ui/error-boundary";
import { getAnimeMeta } from "@/features/anime/anime-queries";
import { AnimeDetail, AnimeDetailSkeleton } from "@/features/anime/components/anime-detail";
import { AnimeHeroSection, AnimeHeroSkeleton } from "@/features/anime/components/anime-hero";

import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const media = await getAnimeMeta(Number(id));
    if (!media) return {};
    const title = media.title.english ?? media.title.romaji ?? "Unknown";
    const description = media.description?.replace(/<[^>]*>/g, "").slice(0, 160) ?? "";
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: media.bannerImage ? [{ url: media.bannerImage }] : [],
      },
      alternates: { canonical: `/anime/${id}` },
    };
  } catch {
    return {};
  }
}

export default function AnimeDetailPage({ params }: PageProps<"/anime/[id]">) {
  return (
    <ErrorBoundary title="Anime details failed to load">
      <Suspense fallback={<AnimeHeroSkeleton />}>
        {params.then(({ id }) => (
          <AnimeHeroSection id={Number(id)} />
        ))}
      </Suspense>
      <Suspense fallback={<AnimeDetailSkeleton />}>
        {params.then(({ id }) => (
          <AnimeDetail id={Number(id)} />
        ))}
      </Suspense>
    </ErrorBoundary>
  );
}
