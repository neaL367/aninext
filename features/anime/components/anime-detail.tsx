import { notFound } from "next/navigation";

import { getAnimeFullDetail } from "@/features/anime/anime-queries";

import { AnimeAiringSchedule, AnimeAiringScheduleSkeleton } from "./anime-airing-schedule";
import { AnimeCharacters, AnimeCharactersSkeleton } from "./anime-characters";
import { AnimeRecommendations, AnimeRecommendationsSkeleton } from "./anime-recommendations";
import { AnimeRelations, AnimeRelationsSkeleton } from "./anime-relations";
import { AnimeStaff, AnimeStaffSkeleton } from "./anime-staff";
import { AnimeStreamingEpisodes, AnimeStreamingEpisodesSkeleton } from "./anime-streaming-episodes";
import { AnimeTrailer, AnimeTrailerSkeleton } from "./anime-trailer";
import { GenreList } from "./genre-pills";
import { SectionHeader } from "./section-header";

export async function AnimeDetail({
  detailPromise,
}: {
  detailPromise: Promise<Awaited<ReturnType<typeof getAnimeFullDetail>>>;
}) {
  const detail = await detailPromise;
  if (!detail) notFound();

  const { media, characters, staff, relations, recommendations, airingSchedule } = detail;

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
        <main className="min-w-0">
          <section aria-label="Characters">
            <SectionHeader
              eyebrow="Cast"
              eyebrowClassName="text-signal"
              title="Characters and voices"
            />
            <div className="mt-7">
              <AnimeCharacters edges={characters} />
            </div>
          </section>

          <section aria-label="More like this" className="border-t border-border-soft pt-12 mt-12">
            <SectionHeader
              eyebrow="Continue"
              eyebrowClassName="text-signal"
              title="More like this"
            />
            <div className="mt-7">
              <AnimeRecommendations nodes={recommendations} />
            </div>
          </section>
        </main>

        <aside className="min-w-0 lg:border-l lg:border-border-soft lg:pl-8">
          <div className="space-y-12">
            <section aria-label="Airing schedule">
              <AnimeAiringSchedule nodes={airingSchedule} />
            </section>
            <section aria-label="Related anime">
              <SectionHeader eyebrow="Universe" eyebrowClassName="text-signal" title="Related" />
              <div className="mt-5">
                <AnimeRelations edges={relations} />
              </div>
            </section>
            <section aria-label="Staff">
              <SectionHeader eyebrow="Credits" eyebrowClassName="text-signal" title="Staff" />
              <div className="mt-5">
                <AnimeStaff edges={staff} />
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
        <main className="min-w-0">
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
        </main>

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
