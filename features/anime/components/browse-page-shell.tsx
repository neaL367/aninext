import { Suspense } from "react";

import { PageTransition } from "@/components/ui/crossfade";
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
    <div className="mx-auto w-full max-w-[1760px] px-4 pb-16 pt-10 sm:px-7 sm:pt-14 lg:px-10">
      <header>
        <h1 className="display text-[clamp(2.8rem,8vw,6rem)]">{config.pageHeading}</h1>
        <div className="mt-6 sm:mt-8">
          <Suspense fallback={<nav className="h-9 border-b border-border-soft" aria-hidden />}>
            <CollectionNav />
          </Suspense>
        </div>
      </header>

      <div className="mt-7 flex items-center gap-3 lg:hidden">
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

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-14">
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-5">
            <Suspense fallback={<SearchBarFallback />}>
              <SearchBar />
            </Suspense>
            <Suspense fallback={<FilterSidebarSkeleton />}>
              <ErrorBoundary title="Filters failed to load">
                <FilterSidebarBoundary collection={collection} genresPromise={genresPromise} />
              </ErrorBoundary>
            </Suspense>
          </div>
        </aside>

        <div className="min-w-0">
          <PageTransition>{children}</PageTransition>
        </div>
      </div>
    </div>
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
