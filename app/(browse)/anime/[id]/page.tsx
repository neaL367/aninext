import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Crossfade } from "@/components/ui/crossfade";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { getAnimeFullDetail } from "@/features/anime/anime-queries";
import { AnimeDetail, AnimeDetailSkeleton } from "@/features/anime/components/anime-detail";
import { AnimeHeroSection, AnimeHeroSkeleton } from "@/features/anime/components/anime-hero";
import { stripHtml } from "@/features/anime/lib/media-helpers";

import type { Metadata } from "next";

function parseAnimeId(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;

  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0 || id > 2_147_483_647) return null;
  return id;
}

function requireAnimeId(value: string): number {
  const id = parseAnimeId(value);
  if (id === null) notFound();
  return id;
}

async function AnimeHeroContent({
  detailPromise,
}: {
  detailPromise: Promise<Awaited<ReturnType<typeof getAnimeFullDetail>>>;
}) {
  return <AnimeHeroSection detailPromise={detailPromise} />;
}

async function AnimeDetailContent({
  detailPromise,
}: {
  detailPromise: Promise<Awaited<ReturnType<typeof getAnimeFullDetail>>>;
}) {
  return <AnimeDetail detailPromise={detailPromise} />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const animeId = parseAnimeId(id);
  if (animeId === null) return {};

  try {
    const detail = await getAnimeFullDetail(animeId);
    if (!detail) return {};
    const media = detail.media;
    const title = media.title.english ?? media.title.romaji ?? "Unknown";
    const description = stripHtml(media.description)?.slice(0, 160) ?? "";
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
  const detailPromise = params.then(({ id }) => getAnimeFullDetail(requireAnimeId(id)));

  return (
    <>
      <ErrorBoundary title="Anime details failed to load">
        <Suspense fallback={<AnimeHeroSkeleton />}>
          <Crossfade>
            <AnimeHeroContent detailPromise={detailPromise} />
          </Crossfade>
        </Suspense>
      </ErrorBoundary>
      <ErrorBoundary title="Anime sections failed to load">
        <Suspense fallback={<AnimeDetailSkeleton />}>
          <Crossfade>
            <AnimeDetailContent detailPromise={detailPromise} />
          </Crossfade>
        </Suspense>
      </ErrorBoundary>
    </>
  );
}
