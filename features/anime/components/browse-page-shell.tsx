import { Suspense } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { Crossfade } from "@/components/crossfade";
import { AnimeResults, AnimeResultsSkeleton } from "@/features/anime/components/anime-results";
import { CollectionNav } from "@/features/anime/components/collection-nav";
import { SearchBar } from "@/features/anime/components/search-bar";
import { FilterSidebar, FilterSidebarSkeleton } from "@/features/anime/components/filter-sidebar";
import { MobileFilterDrawer } from "@/features/anime/components/mobile-filter-drawer";
import { ActiveFilters } from "@/features/anime/components/active-filters";
import { COLLECTIONS } from "@/features/anime/lib/collection-config";
import { getGenres } from "@/features/anime/anime-queries";
import type { AnimeCollection } from "@/features/anime/types/anime";

export function BrowsePageShell({ collection, children }: { collection: AnimeCollection; children: React.ReactNode }) {
  const config = COLLECTIONS[collection];

  return (
    <div className="mx-auto w-full max-w-[1680px] px-4 py-8 sm:px-7 sm:py-12 lg:px-10">
      <header>
        <div className="flex flex-col justify-between gap-6 border-b border-border-soft pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Collection / {collection === "alltimepopular" ? "all time" : collection}</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">{config.pageHeading}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">{config.pageDescription}</p>
          </div>
          <div className="hidden text-right sm:block">
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">Data</p>
            <p className="mt-2 font-mono text-sm text-signal">Live / cached</p>
          </div>
        </div>
        <div className="mt-6"><CollectionNav /></div>
      </header>

      <div className="mt-8 flex items-center gap-3 lg:hidden">
        <div className="min-w-0 flex-1"><SearchBar /></div>
        <Suspense><MobileFilterDrawer genresPromise={getGenres()} collection={collection} /></Suspense>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <p className="eyebrow mb-5">Filters</p>
            <Suspense fallback={<FilterSidebarSkeleton />}><FilterSidebar genresPromise={getGenres()} collection={collection} /></Suspense>
          </div>
        </aside>
        <div className="min-w-0">
          <div className="mb-6 hidden lg:block"><SearchBar /></div>
          <Crossfade>{children}</Crossfade>
        </div>
      </div>
      </div>
  );
}

export function BrowsePageResults({ collection, filters }: { collection: AnimeCollection; filters: import("@/features/anime/types/anime").AnimeFilters }) {
  return (
    <>
      <Suspense><ActiveFilters /></Suspense>
      <ErrorBoundary title="Results failed to load">
        <Suspense fallback={<AnimeResultsSkeleton count={20} />}>
          <AnimeResults collection={collection} filters={filters} />
        </Suspense>
      </ErrorBoundary>
    </>
  );
}
