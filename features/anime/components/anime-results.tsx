import type { AnimeCollection, AnimeFilters } from "@/features/anime/types/anime";
import { buildFilterHash } from "@/features/anime/lib/parse-filters";
import { MediaGridSkeleton } from "./media-grid";
import { BrowsePaginator } from "./browse-paginator";
import { renderBrowsePage } from "./browse-page-action";
import { EmptySearch, EmptyFilters, EmptyUpcoming } from "./empty-states";

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

function getEmptyComponent(
  collection: AnimeCollection,
  filters: AnimeFilters
) {
  if (filters.search) {
    return <EmptySearch />;
  }
  if (filters.genre || filters.format?.length || filters.status?.length || filters.country) {
    return <EmptyFilters />;
  }
  if (collection === "upcoming") {
    return <EmptyUpcoming />;
  }
  return <EmptySearch />;
}

export { MediaGridSkeleton as AnimeResultsSkeleton };
