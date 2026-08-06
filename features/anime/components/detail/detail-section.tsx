import { notFound } from "next/navigation";
import { ErrorBoundary } from "@/components/error-boundary";
import { Crossfade } from "@/components/crossfade";
import { AnimeHero, AnimeHeroSkeleton } from "./anime-hero";
import { AnimeCharacters, AnimeCharactersSkeleton } from "./anime-characters";
import { AnimeStaff, AnimeStaffSkeleton } from "./anime-staff";
import { AnimeRelations, AnimeRelationsSkeleton } from "./anime-relations";
import { AnimeRecommendations, AnimeRecommendationsSkeleton } from "./anime-recommendations";
import { AnimeAiringSchedule, AnimeAiringScheduleSkeleton } from "./anime-airing-schedule";
import { AnimeStreamingEpisodes, AnimeStreamingEpisodesSkeleton } from "./anime-streaming-episodes";
import { AnimeTrailer, AnimeTrailerSkeleton } from "./anime-trailer";
import { GenreList } from "../home/genre-pills";
import { getAnimeDetail } from "@/features/anime/anime-queries";

export async function DetailSection({ id }: { id: number }) {
  const detail = await getAnimeDetail(id);
  if (!detail.media) notFound();

  const { media, characters, staff, relations, recommendations, airingSchedule } = detail;

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
              <div className="mt-7"><AnimeCharacters edges={characters.edges} /></div>
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
                  <AnimeAiringSchedule nodes={airingSchedule} />
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

export function DetailSectionSkeleton() {
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
