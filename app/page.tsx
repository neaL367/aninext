import { Suspense } from "react";

import { PageTransition } from "@/components/ui/crossfade";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { AiringHomeSectionSkeleton } from "@/features/anime/components/airing-home-section";
import { HeroCarouselSkeleton } from "@/features/anime/components/hero-carousel";
import {
  HomeFeaturedShell,
  HomeGenres,
  HomeHero,
  HomeRanking,
  HomeSeason,
  HomeTonight,
  HomeTrending,
  HomeUpcoming,
} from "@/features/anime/components/home-featured";
import { HomeSectionSkeleton } from "@/features/anime/components/home-sections";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discover anime",
  description: "What to watch next. A quiet index of anime worth your evening.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <ErrorBoundary title="Home failed to load">
      <PageTransition>
        <HomeFeaturedShell
          hero={
            <ErrorBoundary title="Featured title failed to load">
              <Suspense fallback={<HeroCarouselSkeleton />}>
                <HomeHero />
              </Suspense>
            </ErrorBoundary>
          }
        >
          <ErrorBoundary title="Trending failed to load">
            <Suspense fallback={<HomeSectionSkeleton kind="row" />}>
              <HomeTrending />
            </Suspense>
          </ErrorBoundary>

          <ErrorBoundary title="This season failed to load">
            <Suspense fallback={<HomeSectionSkeleton kind="mosaic" />}>
              <HomeSeason />
            </Suspense>
          </ErrorBoundary>

          <ErrorBoundary title="Tonight failed to load">
            <Suspense fallback={<AiringHomeSectionSkeleton />}>
              <HomeTonight />
            </Suspense>
          </ErrorBoundary>

          <ErrorBoundary title="Ranking failed to load">
            <Suspense fallback={<HomeSectionSkeleton kind="list" />}>
              <HomeRanking />
            </Suspense>
          </ErrorBoundary>

          <ErrorBoundary title="Upcoming failed to load">
            <Suspense fallback={<HomeSectionSkeleton kind="wide" />}>
              <HomeUpcoming />
            </Suspense>
          </ErrorBoundary>

          <ErrorBoundary title="Genres failed to load">
            <Suspense fallback={<HomeSectionSkeleton kind="wide" />}>
              <HomeGenres />
            </Suspense>
          </ErrorBoundary>
        </HomeFeaturedShell>
      </PageTransition>
    </ErrorBoundary>
  );
}
