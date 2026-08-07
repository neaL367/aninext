import { Suspense } from "react";

import { Crossfade } from "@/components/ui/crossfade";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { getGenres } from "@/features/anime/anime-queries";
import { ActiveFilters, ActiveFiltersSkeleton } from "@/features/anime/components/active-filters";
import { AnimeResults } from "@/features/anime/components/anime-results";
import { CollectionNav } from "@/features/anime/components/collection-nav";
import { MediaGridSkeleton } from "@/features/anime/components/media-grid";
import {
  MobileFilterDrawer,
  MobileFilterDrawerFallback,
} from "@/features/anime/components/mobile-filter-drawer";
import { SearchBar, SearchBarFallback } from "@/features/anime/components/search-bar";
import { COLLECTIONS } from "@/features/anime/lib/collection-config";

import type { AnimeCollection } from "@/features/anime/types/anime";

export function BrowsePageShell({
  collection,
  children,
}: {
  collection: AnimeCollection;
  children: React.ReactNode;
}) {
  const config = COLLECTIONS[collection];
  const genresPromise = getGenres();

  return (
    <Crossfade>
      <div className="mx-auto w-full max-w-[1680px] px-4 py-8 sm:px-7 sm:py-12 lg:px-10 space-y-8">
        <header className="space-y-6 border-b border-border-soft pb-8">
          <div>
            <p className="eyebrow">
              Collection / {collection === "alltimepopular" ? "all time" : collection}
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.055em] text-foreground sm:text-6xl">
              {config.pageHeading}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {config.pageDescription}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
            <div className="min-w-0 flex-1">
              <Suspense fallback={<nav className="h-9 border-b border-border-soft" aria-hidden />}>
                <CollectionNav />
              </Suspense>
            </div>
            <div className="w-full sm:w-72 shrink-0">
              <Suspense fallback={<SearchBarFallback />}>
                <SearchBar />
              </Suspense>
            </div>
          </div>
        </header>

        {/* Collapsible Refine & Filters Toolbar */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <Suspense fallback={<MobileFilterDrawerFallback />}>
              <ErrorBoundary title="Filters failed to load">
                <MobileFilterDrawerBoundary collection={collection} genresPromise={genresPromise} />
              </ErrorBoundary>
            </Suspense>
          </div>
        </div>

        {/* 100% Viewport Width Results Grid */}
        <div className="min-w-0">
          <Crossfade>{children}</Crossfade>
        </div>
      </div>
    </Crossfade>
  );
}

async function MobileFilterDrawerBoundary({
  collection,
  genresPromise,
}: {
  collection: AnimeCollection;
  genresPromise: Promise<string[]>;
}) {
  return <MobileFilterDrawer genresPromise={genresPromise} collection={collection} />;
}

export function BrowsePageResults({
  collection,
  filters,
}: {
  collection: AnimeCollection;
  filters: import("@/features/anime/types/anime").AnimeFilters;
}) {
  return (
    <>
      <Suspense fallback={<ActiveFiltersSkeleton />}>
        <ActiveFilters />
      </Suspense>
      <ErrorBoundary title="Results failed to load">
        <Suspense fallback={<MediaGridSkeleton count={20} />}>
          <AnimeResults collection={collection} filters={filters} />
        </Suspense>
      </ErrorBoundary>
    </>
  );
}
