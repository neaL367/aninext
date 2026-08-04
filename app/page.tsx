import { Suspense } from "react";
import type { Metadata } from "next";
import { ErrorBoundary } from "@/components/error-boundary";
import { HeroCarousel, HeroCarouselSkeleton } from "@/features/anime/components/hero-carousel";
import { SectionRow, SectionRowSkeleton } from "@/features/anime/components/section-row";
import { GenrePills, GenrePillsSkeleton } from "@/features/anime/components/genre-pills";
import { MediaCard, MediaCardSkeleton } from "@/features/anime/components/media-card";
import { getBrowseCollection } from "@/features/anime/anime-queries";
import type { Route } from "next";
import { HoverPrefetchLink } from "@/components/hover-prefetch-link";
import { ArrowRightIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "AniNext — Discover Anime",
  description:
    "Discover trending, popular, and upcoming anime. Browse collections, filter by genre, and find your next favorite show.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Full-bleed hero */}
      <ErrorBoundary title="Featured anime failed to load">
        <Suspense fallback={<HeroCarouselSkeleton />}>
          <HeroSection />
        </Suspense>
      </ErrorBoundary>

      {/* Content sections */}
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 py-12 sm:px-6 sm:py-16 lg:gap-16 lg:px-8 lg:py-20">
        <ErrorBoundary title="Trending section failed to load">
          <Suspense fallback={<SectionRowSkeleton />}>
            <TrendingSection />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary title="Popular section failed to load">
          <Suspense fallback={<FeaturedGridSkeleton />}>
            <PopularSection />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary title="Top 100 section failed to load">
          <Suspense fallback={<SectionRowSkeleton />}>
            <Top100Section />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary title="Upcoming section failed to load">
          <Suspense fallback={<SectionRowSkeleton />}>
            <UpcomingSection />
          </Suspense>
        </ErrorBoundary>

        <Suspense fallback={<GenrePillsSkeleton />}>
          <GenrePills />
        </Suspense>
      </div>
    </div>
  );
}

async function HeroSection() {
  const { items } = await getBrowseCollection("trending", {}, 1, 5);
  if (items.length === 0) return null;
  return <HeroCarousel items={items} />;
}

async function TrendingSection() {
  const { items } = await getBrowseCollection("trending", {}, 1, 12);
  return (
    <SectionRow
      title="Trending Now"
      href="/anime/trending"
      items={items}
      description="What everyone's watching right now"
    />
  );
}

async function PopularSection() {
  const { items } = await getBrowseCollection("popular", {}, 1, 8);
  return <FeaturedGrid title="Popular This Season" href="/anime/popular" items={items} />;
}

async function Top100Section() {
  const { items } = await getBrowseCollection("top100", {}, 1, 12);
  return (
    <SectionRow
      title="Top 100"
      href="/anime/top100"
      items={items}
      description="Highest rated anime of all time"
    />
  );
}

async function UpcomingSection() {
  const { items } = await getBrowseCollection("upcoming", {}, 1, 12);
  return (
    <SectionRow
      title="Coming Soon"
      href="/anime/upcoming"
      items={items}
      description="Not yet released — set your reminders"
    />
  );
}

function FeaturedGrid({
  title,
  href,
  items,
}: {
  title: string;
  href: Route<string>;
  items: { id: number; title: any; coverImage: any; averageScore?: number; format?: string; episodes?: number; status?: string; genres: string[]; bannerImage?: string; description?: string; season?: string; seasonYear?: number; studios?: any }[];
}) {
  if (items.length === 0) return null;
  const featured = items.slice(0, 2);
  const rest = items.slice(2);

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">The most watched shows this season</p>
        </div>
        <HoverPrefetchLink
          href={href}
          className="group hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
        >
          See all
          <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
        </HoverPrefetchLink>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:gap-5 lg:grid-cols-6">
        {featured.map((item) => (
          <div key={item.id} className="col-span-1 sm:col-span-2">
            <MediaCard media={item} size="featured" />
          </div>
        ))}
        {rest.map((item) => (
          <div key={item.id}>
            <MediaCard media={item} />
          </div>
        ))}
      </div>
    </section>
  );
}

function FeaturedGridSkeleton() {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="h-8 w-48 rounded-md shimmer" />
        <div className="h-4 w-64 rounded shimmer" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:gap-5 lg:grid-cols-6">
        <div className="col-span-1 sm:col-span-2">
          <MediaCardSkeleton size="featured" />
        </div>
        <div className="col-span-1 sm:col-span-2">
          <MediaCardSkeleton size="featured" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <MediaCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}
