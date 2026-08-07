import { Suspense } from "react";

import { Crossfade } from "@/components/crossfade";
import { ErrorBoundary } from "@/components/error-boundary";
import { getGenres } from "@/features/anime/anime-queries";
import { ActiveFilters } from "@/features/anime/components/browse/active-filters";
import {
  AnimeResults,
  AnimeResultsSkeleton,
} from "@/features/anime/components/browse/anime-results";
import { CollectionNav } from "@/features/anime/components/browse/collection-nav";
import {
  FilterSidebar,
  FilterSidebarSkeleton,
} from "@/features/anime/components/browse/filter-sidebar";
import { MobileFilterDrawer } from "@/features/anime/components/browse/mobile-filter-drawer";
import { SearchBar } from "@/features/anime/components/browse/search-bar";
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

  return (
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
            <MobileFilterDrawerBoundary collection={collection} />
          </ErrorBoundary>
        </Suspense>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <p className="eyebrow mb-5">Filters</p>
            <Suspense fallback={<FilterSidebarSkeleton />}>
              <ErrorBoundary title="Filters failed to load">
                <FilterSidebarBoundary collection={collection} />
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
          <ErrorBoundary title="Results failed to load">
            <Crossfade>{children}</Crossfade>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}

function SearchBarFallback() {
  return <div className="h-12 border-b border-border-soft bg-surface-1/40" />;
}

async function FilterSidebarBoundary({ collection }: { collection: AnimeCollection }) {
  return <FilterSidebar genresPromise={getGenres()} collection={collection} />;
}

async function MobileFilterDrawerBoundary({ collection }: { collection: AnimeCollection }) {
  return <MobileFilterDrawer genresPromise={getGenres()} collection={collection} />;
}

function MobileFilterDrawerFallback() {
  return <div className="h-10 w-24 border border-border-soft bg-surface-1/40" />;
}

function ActiveFiltersSkeleton() {
  return (
    <div className="flex flex-col gap-3 border-b border-border-soft py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="shimmer h-3 w-12 rounded" />
          <div className="shimmer size-5 rounded-full" />
        </div>
        <div className="shimmer h-3 w-14 rounded" />
      </div>
      <div className="flex flex-wrap gap-3">
        <div className="shimmer h-5 w-20 rounded-full" />
        <div className="shimmer h-5 w-28 rounded-full" />
        <div className="shimmer h-5 w-16 rounded-full" />
      </div>
    </div>
  );
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
        <Suspense fallback={<AnimeResultsSkeleton count={20} />}>
          <AnimeResults collection={collection} filters={filters} />
        </Suspense>
      </ErrorBoundary>
    </>
  );
}
