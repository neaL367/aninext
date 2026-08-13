import { Suspense } from "react";

import { PageTransition } from "@/components/ui/crossfade";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { getAnimeMetadata } from "@/features/anime/anime-metadata";
import { AnimeDetail, AnimeDetailSkeleton } from "@/features/anime/components/anime-detail";
import { AnimeHeroSection, AnimeHeroSkeleton } from "@/features/anime/components/anime-hero";

import type { Metadata } from "next";

function parseAnimeId(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;

  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0 || id > 2_147_483_647) return null;
  return id;
}

export async function generateMetadata({
  params,
}: Pick<PageProps<"/anime/[id]">, "params">): Promise<Metadata> {
  const { id } = await params;
  const animeId = parseAnimeId(id);
  return animeId === null ? {} : getAnimeMetadata(animeId);
}

export default function AnimeDetailPage({ params }: PageProps<"/anime/[id]">) {
  return (
    <>
      <ErrorBoundary title="Anime details failed to load">
        <Suspense fallback={<AnimeHeroSkeleton />}>
          {params.then(({ id }) => (
            <PageTransition>
              <AnimeHeroSection id={parseAnimeId(id)} />
            </PageTransition>
          ))}
        </Suspense>
      </ErrorBoundary>
      <ErrorBoundary title="Anime sections failed to load">
        <Suspense fallback={<AnimeDetailSkeleton />}>
          {params.then(({ id }) => (
            <PageTransition>
              <AnimeDetail id={parseAnimeId(id)} />
            </PageTransition>
          ))}
        </Suspense>
      </ErrorBoundary>
    </>
  );
}
