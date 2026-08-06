import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ErrorBoundary } from "@/components/error-boundary";
import { Crossfade } from "@/components/crossfade";
import { AnimeHero, AnimeHeroSkeleton } from "@/features/anime/components/detail/anime-hero";
import { AnimeCharacters, AnimeCharactersSkeleton } from "@/features/anime/components/detail/anime-characters";
import { AnimeStaff, AnimeStaffSkeleton } from "@/features/anime/components/detail/anime-staff";
import { AnimeRelations, AnimeRelationsSkeleton } from "@/features/anime/components/detail/anime-relations";
import { AnimeRecommendations, AnimeRecommendationsSkeleton } from "@/features/anime/components/detail/anime-recommendations";
import { AnimeAiringScheduleSkeleton, AnimeAiringScheduleAsync } from "@/features/anime/components/detail/anime-airing-schedule";
import { AnimeStreamingEpisodes, AnimeStreamingEpisodesSkeleton } from "@/features/anime/components/detail/anime-streaming-episodes";
import { AnimeTrailer, AnimeTrailerSkeleton } from "@/features/anime/components/detail/anime-trailer";
import { getAnimeHero, getAnimeDetail } from "@/features/anime/anime-queries";
import { GenreList } from "@/features/anime/components/home/genre-pills";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const media = await getAnimeHero(Number(id));
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

export default function AnimeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <ErrorBoundary title="Anime details failed to load">
      <Suspense fallback={<DetailSkeleton />}><DetailSection params={params} /></Suspense>
    </ErrorBoundary>
  );
}

async function DetailSection({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getAnimeDetail(Number(id));
  if (!detail.media) notFound();

  const { media, characters, staff, relations, recommendations } = detail;

  return (
    <Crossfade>
    <div>
      <AnimeHero media={media} />

      <div className="mx-auto w-full max-w-[1680px] px-4 sm:px-7 lg:px-10">
        <section className="border-b border-border-soft py-12">
          <SectionHeading eyebrow="Watch" title="Choose your next scene" />
          <div className="mt-7 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <AnimeTrailer media={media} />
            <AnimeStreamingEpisodes media={media} />
          </div>
        </section>

        <div className="grid gap-16 py-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
          <main className="min-w-0">
            <section aria-label="Characters">
              <SectionHeading eyebrow="Cast" title="Characters and voices" />
              <div className="mt-7"><AnimeCharacters edges={characters.edges} pageInfo={characters.pageInfo} /></div>
            </section>

            <section aria-label="More like this" className="border-t border-border-soft pt-12 mt-12">
              <SectionHeading eyebrow="Continue" title="More like this" />
              <div className="mt-7"><AnimeRecommendations nodes={recommendations} /></div>
            </section>
          </main>

          <aside className="min-w-0 lg:border-l lg:border-border-soft lg:pl-8">
            <div className="space-y-12">
              <section aria-label="Airing schedule">
                <ErrorBoundary title="Schedule failed to load">
                  <Suspense fallback={<div className="mt-5"><AnimeAiringScheduleSkeleton /></div>}>
                    <AnimeAiringScheduleAsync id={Number(id)} />
                  </Suspense>
                </ErrorBoundary>
              </section>
              <section aria-label="Related anime">
                <SectionHeading eyebrow="Universe" title="Related" />
                <div className="mt-5"><AnimeRelations edges={relations} /></div>
              </section>
              <section aria-label="Staff">
                <SectionHeading eyebrow="Credits" title="Staff" />
                <div className="mt-5"><AnimeStaff edges={staff} /></div>
              </section>
              <section aria-label="Genres">
                <SectionHeading eyebrow="Topics" title="Genres" />
                <div className="mt-5"><GenreList genres={media.genres} /></div>
              </section>
            </div>
          </aside>
        </div>
      </div>
    </div>
    </Crossfade>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <div><p className="eyebrow text-accent">{eyebrow}</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">{title}</h2></div>;
}

function DetailSkeleton() {
  return (
    <>
      <AnimeHeroSkeleton />
      <div className="mx-auto w-full max-w-[1680px] px-4 sm:px-7 lg:px-10">
        <div className="border-b border-border-soft py-12">
          <div className="space-y-3"><div className="shimmer h-2.5 w-16 rounded" /><div className="shimmer h-8 w-64 rounded" /></div>
          <div className="mt-7 grid gap-8 lg:grid-cols-2"><AnimeTrailerSkeleton /><AnimeStreamingEpisodesSkeleton /></div>
        </div>
        <div className="grid gap-16 py-12 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <AnimeCharactersSkeleton />
            <div className="mt-12 border-t border-border-soft pt-12"><AnimeRecommendationsSkeleton /></div>
          </div>
          <aside className="space-y-12 lg:border-l lg:border-border-soft lg:pl-8">
            <AnimeAiringScheduleSkeleton />
            <AnimeRelationsSkeleton />
            <AnimeStaffSkeleton />
          </aside>
        </div>
      </div>
    </>
  );
}
