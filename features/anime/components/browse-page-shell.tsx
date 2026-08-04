import { Suspense } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { AnimeResults, AnimeResultsSkeleton } from "@/features/anime/components/anime-results";
import { CollectionNav } from "@/features/anime/components/collection-nav";
import { SearchBar } from "@/features/anime/components/search-bar";
import { FilterSidebar, FilterSidebarSkeleton } from "@/features/anime/components/filter-sidebar";
import { MobileFilterDrawer } from "@/features/anime/components/mobile-filter-drawer";
import { ActiveFilters } from "@/features/anime/components/active-filters";
import { COLLECTIONS } from "@/features/anime/lib/collection-config";
import { getGenres } from "@/features/anime/anime-queries";
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
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4">
        <CollectionNav />
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {config.pageHeading}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {config.pageDescription}
              </p>
            </div>
            <Suspense>
              <MobileFilterDrawer genresPromise={getGenres()} />
            </Suspense>
          </div>
          <SearchBar />
        </div>
      </div>
      <div className="flex gap-8">
        <Suspense fallback={<FilterSidebarSkeleton />}>
          <FilterSidebar genresPromise={getGenres()} />
        </Suspense>
        <div className="flex flex-1 flex-col gap-4">{children}</div>
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
      <Suspense>
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
