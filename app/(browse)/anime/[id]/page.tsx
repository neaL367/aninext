import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ErrorBoundary } from "@/components/error-boundary";
import { AnimeHero, AnimeHeroSkeleton } from "@/features/anime/components/anime-hero";
import { AnimeCharacters, AnimeCharactersSkeleton } from "@/features/anime/components/anime-characters";
import { AnimeStaff, AnimeStaffSkeleton } from "@/features/anime/components/anime-staff";
import { AnimeRelations, AnimeRelationsSkeleton } from "@/features/anime/components/anime-relations";
import { AnimeRecommendations, AnimeRecommendationsSkeleton } from "@/features/anime/components/anime-recommendations";
import { AnimeReviews, AnimeReviewsSkeleton } from "@/features/anime/components/anime-reviews";
import { AnimeAiringSchedule, AnimeAiringScheduleSkeleton } from "@/features/anime/components/anime-airing-schedule";
import { getAnimeHero, getAnimeDetail } from "@/features/anime/anime-queries";

export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const media = await getAnimeHero(Number(id));
    if (!media) return {};

    const title = media.title.english ?? media.title.romaji ?? "Unknown";
    const description = media.description?.slice(0, 160) ?? "";

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

export default async function AnimeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return params.then(async ({ id }) => {
    const numericId = Number(id);

    return (
      <ErrorBoundary title="Anime details failed to load">
        <Suspense fallback={<DetailSkeleton />}>
          <DetailSection id={numericId} />
        </Suspense>
      </ErrorBoundary>
    );
  });
}

async function DetailSection({ id }: { id: number }) {
  const detail = await getAnimeDetail(id);
  if (!detail.media) notFound();

  const { media, characters, staff, relations, recommendations, reviews, airingSchedule } = detail;

  return (
    <div className="flex flex-col">
      <AnimeHero media={media} />

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
          {/* Main column */}
          <div className="flex flex-1 flex-col gap-10">
            <section aria-label="Characters">
              <AnimeCharacters edges={characters.edges} pageInfo={characters.pageInfo} />
            </section>

            <section className="border-t border-border-soft pt-10" aria-label="Recommendations">
              <AnimeRecommendations nodes={recommendations} />
            </section>

            <section className="border-t border-border-soft pt-10" aria-label="Reviews">
              <AnimeReviews nodes={reviews} />
            </section>
          </div>

          {/* Side column */}
          <aside className="flex w-full flex-col gap-10 lg:w-80 lg:shrink-0">
            <section aria-label="Related anime">
              <AnimeRelations edges={relations} />
            </section>

            <section aria-label="Staff">
              <AnimeStaff edges={staff} />
            </section>

            <section aria-label="Airing schedule">
              <AnimeAiringSchedule nodes={airingSchedule} />
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <>
      <AnimeHeroSkeleton />
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
          <div className="flex flex-1 flex-col gap-10">
            <AnimeCharactersSkeleton />
            <div className="border-t border-border-soft pt-10"><AnimeRecommendationsSkeleton /></div>
            <div className="border-t border-border-soft pt-10"><AnimeReviewsSkeleton /></div>
          </div>
          <aside className="flex w-full flex-col gap-10 lg:w-80 lg:shrink-0">
            <AnimeRelationsSkeleton />
            <AnimeStaffSkeleton />
            <AnimeAiringScheduleSkeleton />
          </aside>
        </div>
      </div>
    </>
  );
}
