import { Suspense } from "react";

import { Crossfade } from "@/components/ui/crossfade";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { getGenres } from "@/features/anime/anime-queries";
import { ActiveFilters, ActiveFiltersSkeleton } from "@/features/anime/components/active-filters";
import { AnimeResults } from "@/features/anime/components/anime-results";
import { CollectionNav } from "@/features/anime/components/collection-nav";
import { FilterSidebar, FilterSidebarSkeleton } from "@/features/anime/components/filter-sidebar";
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
      <div className="mx-auto w-full max-w-[1680px] px-4 py-8 sm:px-7 sm:py-12 lg:px-10">
        <header>
          <div className="flex flex-col justify-between gap-6 border-b border-border-soft pb-8 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">
                Collection / {collection === "alltimepopular" ? "all time" : collection}
              </p>
              <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">
                {config.pageHeading}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
                {config.pageDescription}
              </p>
            </div>
          </div>
          <div className="mt-6">
            <Suspense fallback={<nav className="h-9 border-b border-border-soft" aria-hidden />}>
              <CollectionNav />
            </Suspense>
          </div>
        </header>

        <div className="mt-8 flex items-center gap-3 lg:hidden">
          <div className="min-w-0 flex-1">
            <Suspense fallback={<SearchBarFallback />}>
              <SearchBar />
            </Suspense>
          </div>
          <Suspense fallback={<MobileFilterDrawerFallback />}>
            <ErrorBoundary title="Filters failed to load">
              <MobileFilterDrawerBoundary collection={collection} genresPromise={genresPromise} />
            </ErrorBoundary>
          </Suspense>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-12">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="eyebrow mb-5">Filters</p>
              <Suspense fallback={<FilterSidebarSkeleton />}>
                <ErrorBoundary title="Filters failed to load">
                  <FilterSidebarBoundary collection={collection} genresPromise={genresPromise} />
                </ErrorBoundary>
              </Suspense>
            </div>
          </aside>
          <div className="min-w-0">
            <div className="mb-6 hidden lg:block">
              <Suspense fallback={<SearchBarFallback />}>
                <SearchBar />
              </Suspense>
            </div>
            <Crossfade>{children}</Crossfade>
          </div>
        </div>
      </div>
    </Crossfade>
  );
}

async function FilterSidebarBoundary({
  collection,
  genresPromise,
}: {
  collection: AnimeCollection;
  genresPromise: Promise<string[]>;
}) {
  return <FilterSidebar genresPromise={genresPromise} collection={collection} />;
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
