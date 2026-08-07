import { Suspense } from "react";

import { Crossfade } from "@/components/ui/crossfade";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { AiringHomeSectionSkeleton } from "@/features/anime/components/airing-home-section";
import { AiringSection } from "@/features/anime/components/airing-section";
import { FeatureMosaicSkeleton, PopularSection } from "@/features/anime/components/feature-mosaic";
import { GenreExplorer, GenrePillsSkeleton } from "@/features/anime/components/genre-pills";
import { HeroCarouselSkeleton } from "@/features/anime/components/hero-carousel";
import { HeroSection } from "@/features/anime/components/hero-section";
import {
  AllTimePopularSection,
  SectionRowSkeleton,
  Top100Section,
  TrendingSection,
  UpcomingSection,
} from "@/features/anime/components/section-row";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AniNext — Discover anime",
  description: "Discover what is airing, rising, and worth your next evening.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <Crossfade>
      <div className="home-page">
        <ErrorBoundary title="Featured anime failed to load">
          <Suspense fallback={<HeroCarouselSkeleton />}>
            <HeroSection />
          </Suspense>
        </ErrorBoundary>

        <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-16 px-4 py-14 sm:px-7 sm:py-20 lg:gap-24 lg:px-10">
          <ErrorBoundary title="Trending section failed to load">
            <Suspense fallback={<SectionRowSkeleton />}>
              <TrendingSection />
            </Suspense>
          </ErrorBoundary>

          <ErrorBoundary title="Popular section failed to load">
            <Suspense fallback={<FeatureMosaicSkeleton />}>
              <PopularSection />
            </Suspense>
          </ErrorBoundary>

          <ErrorBoundary title="Airing today section failed to load">
            <Suspense fallback={<AiringHomeSectionSkeleton />}>
              <AiringSection />
            </Suspense>
          </ErrorBoundary>

          <ErrorBoundary title="Top 100 section failed to load">
            <Suspense fallback={<SectionRowSkeleton />}>
              <Top100Section />
            </Suspense>
          </ErrorBoundary>

          <ErrorBoundary title="Upcoming section failed to load">
            <Suspense fallback={<SectionRowSkeleton count={5} />}>
              <UpcomingSection />
            </Suspense>
          </ErrorBoundary>

          <ErrorBoundary title="All time popular section failed to load">
            <Suspense fallback={<SectionRowSkeleton count={5} />}>
              <AllTimePopularSection />
            </Suspense>
          </ErrorBoundary>

          <ErrorBoundary title="Genre explorer failed to load">
            <Suspense fallback={<GenrePillsSkeleton />}>
              <GenreExplorer />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </Crossfade>
  );
}
