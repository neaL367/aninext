import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ErrorBoundary } from "@/components/ui/error-boundary";
import { getAnimePageBatch } from "@/features/anime/anime-queries";

import { AnimeAiringSchedule, AnimeAiringScheduleSkeleton } from "./anime-airing-schedule";
import { AnimeCharacters, AnimeCharactersSkeleton } from "./anime-characters";
import { AnimeRecommendations, AnimeRecommendationsSkeleton } from "./anime-recommendations";
import { AnimeRelations, AnimeRelationsSkeleton } from "./anime-relations";
import { AnimeStaff, AnimeStaffSkeleton } from "./anime-staff";
import { AnimeStreamingEpisodes, AnimeStreamingEpisodesSkeleton } from "./anime-streaming-episodes";
import { AnimeTrailer, AnimeTrailerSkeleton } from "./anime-trailer";
import { GenreList } from "./genre-pills";
import { SectionHeader } from "./section-header";

export async function AnimeDetail({ id }: { id: number | null }) {
  if (id === null) notFound();

  const { media } = await getAnimePageBatch(id);
  if (!media) notFound();

  return (
    <div className="mx-auto w-full max-w-[1760px] px-4 sm:px-7 lg:px-10">
      <section className="rule py-10 sm:py-12">
        <SectionHeader title="Watch" />
        <div
          className={
            media.trailer?.id && media.trailer.site === "youtube"
              ? "grid gap-8 lg:grid-cols-[1.15fr_0.85fr]"
              : "max-w-4xl"
          }
        >
          {media.trailer?.id && media.trailer.site === "youtube" && <AnimeTrailer media={media} />}
          <AnimeStreamingEpisodes media={media} />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-14 pb-16 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-16">
        <div className="min-w-0 space-y-14">
          <section aria-label="Characters">
            <SectionHeader title="Characters and voices" />
            <ErrorBoundary title="Characters failed to load">
              <Suspense fallback={<AnimeCharactersSkeleton />}>
                <CharactersSection id={id} />
              </Suspense>
            </ErrorBoundary>
          </section>

          <section aria-label="More like this" className="rule pt-12">
            <SectionHeader title="More like this" />
            <ErrorBoundary title="Recommendations failed to load">
              <Suspense fallback={<AnimeRecommendationsSkeleton />}>
                <RecommendationsSection id={id} />
              </Suspense>
            </ErrorBoundary>
          </section>
        </div>

        <aside className="min-w-0 space-y-12 lg:border-l lg:border-border-soft lg:pl-8">
          <section aria-label="Airing schedule">
            <ErrorBoundary title="Schedule failed to load">
              <Suspense fallback={<AnimeAiringScheduleSkeleton />}>
                <AiringSection id={id} />
              </Suspense>
            </ErrorBoundary>
          </section>

          <section aria-label="Related anime">
            <SectionHeader title="Related" />
            <ErrorBoundary title="Related anime failed to load">
              <Suspense fallback={<AnimeRelationsSkeleton />}>
                <RelationsSection id={id} />
              </Suspense>
            </ErrorBoundary>
          </section>

          <section aria-label="Staff">
            <SectionHeader title="Staff" />
            <ErrorBoundary title="Staff failed to load">
              <Suspense fallback={<AnimeStaffSkeleton />}>
                <StaffSection id={id} />
              </Suspense>
            </ErrorBoundary>
          </section>

          <section aria-label="Genres">
            <SectionHeader title="Genres" />
            <GenreList genres={media.genres} />
          </section>
        </aside>
      </div>
    </div>
  );
}

async function CharactersSection({ id }: { id: number }) {
  const { characters } = await getAnimePageBatch(id);
  return <AnimeCharacters edges={characters} />;
}

async function RecommendationsSection({ id }: { id: number }) {
  const { recommendations } = await getAnimePageBatch(id);
  return <AnimeRecommendations nodes={recommendations} />;
}

async function AiringSection({ id }: { id: number }) {
  const { airingSchedule } = await getAnimePageBatch(id);
  return <AnimeAiringSchedule nodes={airingSchedule} />;
}

async function RelationsSection({ id }: { id: number }) {
  const { relations } = await getAnimePageBatch(id);
  return <AnimeRelations edges={relations} />;
}

async function StaffSection({ id }: { id: number }) {
  const { staff } = await getAnimePageBatch(id);
  return <AnimeStaff edges={staff} />;
}

export function AnimeDetailSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1760px] px-4 sm:px-7 lg:px-10">
      <section className="rule py-10 sm:py-12">
        <div className="mb-6 border-b border-border-soft pb-4">
          <div className="shimmer h-8 w-28 rounded-[2px]" />
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <AnimeTrailerSkeleton />
          <AnimeStreamingEpisodesSkeleton />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-14 pb-16 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-16">
        <div className="min-w-0 space-y-14">
          <section aria-label="Characters">
            <div className="mb-6 border-b border-border-soft pb-4">
              <div className="shimmer h-8 w-64 rounded-[2px]" />
            </div>
            <AnimeCharactersSkeleton />
          </section>

          <section aria-label="More like this" className="rule pt-12">
            <div className="mb-6 border-b border-border-soft pb-4">
              <div className="shimmer h-8 w-48 rounded-[2px]" />
            </div>
            <AnimeRecommendationsSkeleton />
          </section>
        </div>

        <aside className="min-w-0 space-y-12 lg:border-l lg:border-border-soft lg:pl-8">
          <section aria-label="Airing schedule">
            <AnimeAiringScheduleSkeleton />
          </section>
          <section aria-label="Related anime">
            <div className="mb-5 border-b border-border-soft pb-4">
              <div className="shimmer h-7 w-24 rounded-[2px]" />
            </div>
            <AnimeRelationsSkeleton />
          </section>
          <section aria-label="Staff">
            <div className="mb-5 border-b border-border-soft pb-4">
              <div className="shimmer h-7 w-20 rounded-[2px]" />
            </div>
            <AnimeStaffSkeleton />
          </section>
        </aside>
      </div>
    </div>
  );
}
