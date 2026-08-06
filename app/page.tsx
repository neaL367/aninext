import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { ErrorBoundary } from "@/components/error-boundary";
import { Crossfade } from "@/components/crossfade";
import { HeroCarousel, HeroCarouselSkeleton } from "@/features/anime/components/home/hero-carousel";
import { SectionRow, SectionRowSkeleton } from "@/features/anime/components/home/section-row";
import { FeatureMosaic, FeatureMosaicSkeleton } from "@/features/anime/components/home/feature-mosaic";
import { getBrowseCollection, getAiringWeek } from "@/features/anime/anime-queries";
import { GenreExplorer, GenrePillsSkeleton } from "@/features/anime/components/home/genre-pills";
import { AiringHomeSection, AiringHomeSectionSkeleton } from "@/features/anime/components/airing/airing-home-section";

export const metadata: Metadata = {
  title: "AniNext — Discover anime",
  description: "Discover what is airing, rising, and worth your next evening.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <div className="home-page">
      <Crossfade>
        <ErrorBoundary title="Featured anime failed to load">
        <Suspense fallback={<HeroCarouselSkeleton />}>
          <HeroSection />
        </Suspense>
      </ErrorBoundary>

      <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-16 px-4 py-14 sm:px-7 sm:py-20 lg:gap-24 lg:px-10">
        <ErrorBoundary title="Trending section failed to load">
          <Suspense fallback={<SectionRowSkeleton />}><TrendingSection /></Suspense>
        </ErrorBoundary>

        <ErrorBoundary title="Popular section failed to load">
          <Suspense fallback={<FeatureMosaicSkeleton />}><PopularSection /></Suspense>
        </ErrorBoundary>

        <ErrorBoundary title="Airing today section failed to load">
          <Suspense fallback={<AiringHomeSectionSkeleton />}><AiringSection /></Suspense>
        </ErrorBoundary>

        <ErrorBoundary title="Top 100 section failed to load">
          <Suspense fallback={<SectionRowSkeleton />}><Top100Section /></Suspense>
        </ErrorBoundary>

        <ErrorBoundary title="Upcoming section failed to load">
          <Suspense fallback={<SectionRowSkeleton count={5} />}><UpcomingSection /></Suspense>
        </ErrorBoundary>

        <ErrorBoundary title="All time popular section failed to load">
          <Suspense fallback={<SectionRowSkeleton count={5} />}><AllTimePopularSection /></Suspense>
        </ErrorBoundary>

        <ErrorBoundary title="Genre explorer failed to load">
          <Suspense fallback={<GenrePillsSkeleton />}><GenreExplorer /></Suspense>
        </ErrorBoundary>
      </div>
      </Crossfade>
    </div>
  );
}

async function HeroSection() {
  const { items } = await getBrowseCollection("trending", {}, 1, 5);
  if (items.length === 0) return null;
  return <HeroCarousel items={items} />;
}

async function TrendingSection() {
  const { items } = await getBrowseCollection("trending", {}, 1, 14);
  return <SectionRow title="Trending now" href="/anime/trending" items={items} description="The titles people are watching right now." />;
}

async function PopularSection() {
  const { items } = await getBrowseCollection("popular", {}, 1, 5);
  return <FeatureMosaic title="Popular this season" href="/anime/popular" items={items} />;
}

async function AiringSection() {
  await connection();
  const now = Math.floor(Date.now() / 1000);
  const start = now - 43200;
  const end = now + 129600;
  const schedules = await getAiringWeek(start, end);
  return <AiringHomeSection schedules={schedules} />;
}

async function Top100Section() {
  const { items } = await getBrowseCollection("top100", {}, 1, 14);
  return <SectionRow title="Top 100" href="/anime/top100" items={items} description="A measured ranking of anime with staying power." showRank />;
}

async function UpcomingSection() {
  const { items } = await getBrowseCollection("upcoming", {}, 1, 7);
  return <SectionRow title="Coming soon" href="/anime/upcoming" items={items} description="Not yet released, already on the radar." />;
}

async function AllTimePopularSection() {
  const { items } = await getBrowseCollection("alltimepopular", {}, 1, 7);
  return <SectionRow title="All time" href="/anime/alltimepopular" items={items} description="Enduring favorites with lasting appeal." />;
}
