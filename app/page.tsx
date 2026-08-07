import { Suspense } from "react";

import { Crossfade } from "@/components/ui/crossfade";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { AiringHomeSectionSkeleton } from "@/features/anime/components/airing-home-section";
import { FeatureMosaicSkeleton } from "@/features/anime/components/feature-mosaic";
import { GenrePillsSkeleton } from "@/features/anime/components/genre-pills";
import { HeroCarouselSkeleton } from "@/features/anime/components/hero-carousel";
import {
  HomeAiringSection,
  HomeCollectionSection,
  HomeFeaturedShell,
  HomeGenreSection,
  HomeHero,
} from "@/features/anime/components/home-featured";
import { SectionRowSkeleton } from "@/features/anime/components/section-row";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AniNext — Discover anime",
  description: "Discover what is airing, rising, and worth your next evening.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <ErrorBoundary title="Home failed to load">
      <Crossfade>
        <HomeFeaturedShell
          hero={
            <ErrorBoundary title="Featured anime failed to load">
              <Suspense fallback={<HeroCarouselSkeleton />}>
                <HomeHero />
              </Suspense>
            </ErrorBoundary>
          }
        >
          <ErrorBoundary title="Trending failed to load">
            <Suspense fallback={<SectionRowSkeleton />}>
              <HomeCollectionSection
                collection="trending"
                title="Trending now"
                href="/anime/trending"
                perPage={14}
                description="The titles people are watching right now."
              />
            </Suspense>
          </ErrorBoundary>
          <ErrorBoundary title="Popular anime failed to load">
            <Suspense fallback={<FeatureMosaicSkeleton />}>
              <HomeCollectionSection
                collection="popular"
                title="Popular this season"
                href="/anime/popular"
                perPage={5}
                mosaic
              />
            </Suspense>
          </ErrorBoundary>
          <ErrorBoundary title="Airing anime failed to load">
            <Suspense fallback={<AiringHomeSectionSkeleton />}>
              <HomeAiringSection />
            </Suspense>
          </ErrorBoundary>
          <ErrorBoundary title="Top anime failed to load">
            <Suspense fallback={<SectionRowSkeleton />}>
              <HomeCollectionSection
                collection="top100"
                title="Top 100"
                href="/anime/top100"
                perPage={14}
                description="A measured ranking of anime with staying power."
                showRank
              />
            </Suspense>
          </ErrorBoundary>
          <ErrorBoundary title="Upcoming anime failed to load">
            <Suspense fallback={<SectionRowSkeleton count={5} />}>
              <HomeCollectionSection
                collection="upcoming"
                title="Coming soon"
                href="/anime/upcoming"
                perPage={7}
                description="Not yet released, already on the radar."
              />
            </Suspense>
          </ErrorBoundary>
          <ErrorBoundary title="All-time anime failed to load">
            <Suspense fallback={<SectionRowSkeleton count={5} />}>
              <HomeCollectionSection
                collection="alltimepopular"
                title="All time"
                href="/anime/alltimepopular"
                perPage={7}
                description="Enduring favorites with lasting appeal."
              />
            </Suspense>
          </ErrorBoundary>
          <ErrorBoundary title="Genres failed to load">
            <Suspense fallback={<GenrePillsSkeleton />}>
              <HomeGenreSection />
            </Suspense>
          </ErrorBoundary>
        </HomeFeaturedShell>
      </Crossfade>
    </ErrorBoundary>
  );
}
