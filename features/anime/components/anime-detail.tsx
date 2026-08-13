import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ErrorBoundary } from "@/components/ui/error-boundary";
import {
  getAnimeAiringSchedule,
  getAnimeCharacters,
  getAnimeDetail,
  getAnimeRecommendations,
  getAnimeRelations,
  getAnimeStaff,
} from "@/features/anime/anime-queries";

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

  const media = await getAnimeDetail(id);
  if (!media) notFound();

  return (
    <div className="mx-auto w-full max-w-[1680px] px-4 sm:px-7 lg:px-10">
      <section className="border-b border-border-soft py-12">
        <SectionHeader
          eyebrow="Watch"
          eyebrowClassName="text-signal"
          title="Choose your next scene"
        />
        <div className="mt-7 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <AnimeTrailer media={media} />
          <AnimeStreamingEpisodes media={media} />
        </div>
      </section>

      <div className="grid gap-16 py-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
        <div className="min-w-0">
          <section aria-label="Characters">
            <SectionHeader
              eyebrow="Cast"
              eyebrowClassName="text-signal"
              title="Characters and voices"
            />
            <div className="mt-7">
              <ErrorBoundary title="Characters failed to load">
                <Suspense fallback={<AnimeCharactersSkeleton />}>
                  <CharactersSection id={id} />
                </Suspense>
              </ErrorBoundary>
            </div>
          </section>

          <section aria-label="More like this" className="border-t border-border-soft pt-12 mt-12">
            <SectionHeader
              eyebrow="Continue"
              eyebrowClassName="text-signal"
              title="More like this"
            />
            <div className="mt-7">
              <ErrorBoundary title="Recommendations failed to load">
                <Suspense fallback={<AnimeRecommendationsSkeleton />}>
                  <RecommendationsSection id={id} />
                </Suspense>
              </ErrorBoundary>
            </div>
          </section>
        </div>

        <aside className="min-w-0 lg:border-l lg:border-border-soft lg:pl-8">
          <div className="space-y-12">
            <section aria-label="Airing schedule">
              <ErrorBoundary title="Schedule failed to load">
                <Suspense fallback={<AnimeAiringScheduleSkeleton />}>
                  <AiringSection id={id} />
                </Suspense>
              </ErrorBoundary>
            </section>
            <section aria-label="Related anime">
              <SectionHeader eyebrow="Universe" eyebrowClassName="text-signal" title="Related" />
              <div className="mt-5">
                <ErrorBoundary title="Related anime failed to load">
                  <Suspense fallback={<AnimeRelationsSkeleton />}>
                    <RelationsSection id={id} />
                  </Suspense>
                </ErrorBoundary>
              </div>
            </section>
            <section aria-label="Staff">
              <SectionHeader eyebrow="Credits" eyebrowClassName="text-signal" title="Staff" />
              <div className="mt-5">
                <ErrorBoundary title="Staff failed to load">
                  <Suspense fallback={<AnimeStaffSkeleton />}>
                    <StaffSection id={id} />
                  </Suspense>
                </ErrorBoundary>
              </div>
            </section>
            <section aria-label="Genres">
              <SectionHeader eyebrow="Topics" eyebrowClassName="text-signal" title="Genres" />
              <div className="mt-5">
                <GenreList genres={media.genres} />
              </div>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}

async function CharactersSection({ id }: { id: number }) {
  const edges = await getAnimeCharacters(id);
  return <AnimeCharacters edges={edges} />;
}

async function RecommendationsSection({ id }: { id: number }) {
  const nodes = await getAnimeRecommendations(id);
  return <AnimeRecommendations nodes={nodes} />;
}

async function AiringSection({ id }: { id: number }) {
  const nodes = await getAnimeAiringSchedule(id);
  return <AnimeAiringSchedule nodes={nodes} />;
}

async function RelationsSection({ id }: { id: number }) {
  const edges = await getAnimeRelations(id);
  return <AnimeRelations edges={edges} />;
}

async function StaffSection({ id }: { id: number }) {
  const edges = await getAnimeStaff(id);
  return <AnimeStaff edges={edges} />;
}

export function AnimeDetailSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1680px] px-4 sm:px-7 lg:px-10">
      <section className="border-b border-border-soft py-12">
        <div className="space-y-3">
          <div className="shimmer h-3.5 w-16 rounded" />
          <div className="shimmer h-8 w-64 rounded" />
        </div>
        <div className="mt-7 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <AnimeTrailerSkeleton />
          <AnimeStreamingEpisodesSkeleton />
        </div>
      </section>

      <div className="grid gap-16 py-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
        <div className="min-w-0">
          <section aria-label="Characters">
            <div className="space-y-3">
              <div className="shimmer h-3.5 w-16 rounded" />
              <div className="shimmer h-8 w-56 rounded" />
            </div>
            <div className="mt-7">
              <AnimeCharactersSkeleton />
            </div>
          </section>

          <section aria-label="More like this" className="border-t border-border-soft pt-12 mt-12">
            <div className="space-y-3">
              <div className="shimmer h-3.5 w-20 rounded" />
              <div className="shimmer h-8 w-48 rounded" />
            </div>
            <div className="mt-7">
              <AnimeRecommendationsSkeleton />
            </div>
          </section>
        </div>

        <aside className="min-w-0 lg:border-l lg:border-border-soft lg:pl-8">
          <div className="space-y-12">
            <section aria-label="Airing schedule">
              <AnimeAiringScheduleSkeleton />
            </section>
            <section aria-label="Related anime">
              <div className="space-y-3">
                <div className="shimmer h-3.5 w-16 rounded" />
                <div className="shimmer h-6 w-32 rounded" />
              </div>
              <div className="mt-5">
                <AnimeRelationsSkeleton />
              </div>
            </section>
            <section aria-label="Staff">
              <div className="space-y-3">
                <div className="shimmer h-3.5 w-16 rounded" />
                <div className="shimmer h-6 w-28 rounded" />
              </div>
              <div className="mt-5">
                <AnimeStaffSkeleton />
              </div>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}
