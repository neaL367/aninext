import { notFound } from "next/navigation";

import { getAnimeDetailSections, getAnimeHero } from "@/features/anime/anime-queries";

import { AnimeAiringSchedule, AnimeAiringScheduleSkeleton } from "./anime-airing-schedule";
import { AnimeCharacters, AnimeCharactersSkeleton } from "./anime-characters";
import { AnimeRecommendations, AnimeRecommendationsSkeleton } from "./anime-recommendations";
import { AnimeRelations, AnimeRelationsSkeleton } from "./anime-relations";
import { AnimeStaff, AnimeStaffSkeleton } from "./anime-staff";
import { AnimeStreamingEpisodes, AnimeStreamingEpisodesSkeleton } from "./anime-streaming-episodes";
import { AnimeTrailer, AnimeTrailerSkeleton } from "./anime-trailer";
import { GenreList } from "./genre-pills";
import { SectionHeader } from "./section-header";

export async function AnimeDetail({ id }: { id: number }) {
  const [media, detail] = await Promise.all([getAnimeHero(id), getAnimeDetailSections(id)]);
  if (!media || !detail) notFound();

  const { characters, staff, relations, recommendations, airingSchedule } = detail;

  return (
    <div className="mx-auto w-full max-w-[1680px] px-4 sm:px-7 lg:px-10">
      <section className="border-b border-border-soft py-12">
        <SectionHeader
          eyebrow="Watch"
          eyebrowClassName="text-accent"
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
              eyebrowClassName="text-accent"
              title="Characters and voices"
            />
            <div className="mt-7">
              <AnimeCharacters edges={characters.edges} />
            </div>
          </section>

          <section aria-label="More like this" className="border-t border-border-soft pt-12 mt-12">
            <SectionHeader
              eyebrow="Continue"
              eyebrowClassName="text-accent"
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
              <SectionHeader eyebrow="Universe" eyebrowClassName="text-accent" title="Related" />
              <div className="mt-5">
                <AnimeRelations edges={relations} />
              </div>
            </section>
            <section aria-label="Staff">
              <SectionHeader eyebrow="Credits" eyebrowClassName="text-accent" title="Staff" />
              <div className="mt-5">
                <AnimeStaff edges={staff} />
              </div>
            </section>
            <section aria-label="Genres">
              <SectionHeader eyebrow="Topics" eyebrowClassName="text-accent" title="Genres" />
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
      <div className="border-b border-border-soft py-12">
        <div className="space-y-3">
          <div className="shimmer h-2.5 w-16 rounded" />
          <div className="shimmer h-8 w-64 rounded" />
        </div>
        <div className="mt-7 grid gap-8 lg:grid-cols-2">
          <AnimeTrailerSkeleton />
          <AnimeStreamingEpisodesSkeleton />
        </div>
      </div>
      <div className="grid gap-16 py-12 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <AnimeCharactersSkeleton />
          <div className="mt-12 border-t border-border-soft pt-12">
            <AnimeRecommendationsSkeleton />
          </div>
        </div>
        <aside className="space-y-12 lg:border-l lg:border-border-soft lg:pl-8">
          <AnimeAiringScheduleSkeleton />
          <AnimeRelationsSkeleton />
          <AnimeStaffSkeleton />
        </aside>
      </div>
    </div>
  );
}
