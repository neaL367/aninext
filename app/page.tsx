import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { ErrorBoundary } from "@/components/error-boundary";
import { Crossfade } from "@/components/crossfade";
import { HoverPrefetchLink } from "@/components/hover-prefetch-link";
import { ArrowUpRightIcon } from "lucide-react";
import type { Route } from "next";
import { HeroCarousel, HeroCarouselSkeleton } from "@/features/anime/components/hero-carousel";
import { SectionRow, SectionRowSkeleton } from "@/features/anime/components/section-row";
import { MediaCard, MediaCardSkeleton } from "@/features/anime/components/media-card";
import { AnimePreviewCard } from "@/features/anime/components/anime-preview-card";
import { getBrowseCollection, getAiringWeek } from "@/features/anime/anime-queries";
import type { Media } from "@/features/anime/types/anime";
import { GenreExplorer, GenrePillsSkeleton } from "@/features/anime/components/genre-pills";
import { AiringHomeSection, AiringHomeSectionSkeleton } from "@/features/anime/components/airing-home-section";

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
  const today = new Date();
  const start = Math.floor(new Date(today.setHours(0, 0, 0, 0)).getTime() / 1000);
  const schedules = await getAiringWeek(start, start + 86400);
  return <AiringHomeSection schedules={schedules.slice(0, 7)} />;
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

function FeatureMosaic({ title, href, items }: { title: string; href: Route<string>; items: Media[] }) {
  if (items.length === 0) return null;
  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-5">
        <div><p className="eyebrow">Seasonal radar</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">{title}</h2></div>
        <HoverPrefetchLink href={href} className="group flex items-center gap-2 border-b border-border-soft pb-1 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground hover:border-accent hover:text-accent">View all <ArrowUpRightIcon className="size-3 transition-transform group-hover:translate-x-0.5" /></HoverPrefetchLink>
      </div>
      <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
        {items.slice(0, 5).map((item) => (
          <div key={item.id}>
            <AnimePreviewCard media={item}><MediaCard media={item} /></AnimePreviewCard>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeatureMosaicSkeleton() {
  return (
    <section>
      <div className="mb-5 space-y-3"><div className="shimmer h-2.5 w-24 rounded" /><div className="shimmer h-8 w-56 rounded" /></div>
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">{Array.from({ length: 5 }).map((_, i) => <MediaCardSkeleton key={i} />)}</div>
    </section>
  );
}
