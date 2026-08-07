import { renderBrowsePage } from "@/features/anime/anime-actions";
import { buildFilterHash } from "@/features/anime/lib/parse-filters";

import { BrowsePaginator } from "./browse-paginator";
import { EmptySearch, EmptyFilters, EmptyUpcoming } from "./empty-states";
import { MediaGridSkeleton } from "./media-grid";

import type { AnimeCollection, AnimeFilters } from "@/features/anime/types/anime";

export async function AnimeResults({
  collection,
  filters,
}: {
  collection: AnimeCollection;
  filters: AnimeFilters;
}) {
  const firstPagePromise = renderBrowsePage(collection, filters, 1);

  return (
    <BrowsePaginator
      key={buildFilterHash(filters)}
      initialPage={firstPagePromise}
      collection={collection}
      filters={filters}
      skeleton={<MediaGridSkeleton count={25} />}
      emptyComponent={getEmptyComponent(collection, filters)}
    />
  );
}

function getEmptyComponent(collection: AnimeCollection, filters: AnimeFilters) {
  if (filters.search) {
    return <EmptySearch />;
  }
  if (
    filters.genre?.length ||
    filters.format?.length ||
    filters.status?.length ||
    filters.country
  ) {
    return <EmptyFilters />;
  }
  if (collection === "upcoming") {
    return <EmptyUpcoming />;
  }
  return <EmptySearch />;
}
