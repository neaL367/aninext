import { renderBrowsePage } from "@/features/anime/components/browse-page-action";
import { buildFilterHash } from "@/features/anime/lib/parse-filters";

import { BrowsePaginator } from "./browse-paginator";
import { EmptySearch, EmptyFilters, EmptyUpcoming } from "./empty-states";
import { MediaGridSkeleton } from "./media-grid";

import type { AnimeCollection, AnimeFilters } from "@/features/anime/types/anime";

const BROWSE_PAGE_SIZE = 12;
const TOP100_PAGE_SIZE = 20;

export async function AnimeResults({
  collection,
  filters,
}: {
  collection: AnimeCollection;
  filters: AnimeFilters;
}) {
  const pageSize = collection === "top100" ? TOP100_PAGE_SIZE : BROWSE_PAGE_SIZE;
  const firstPagePromise = renderBrowsePage(collection, filters, 1, pageSize);

  return (
    <BrowsePaginator
      key={buildFilterHash(filters)}
      initialPage={firstPagePromise}
      collection={collection}
      filters={filters}
      pageSize={pageSize}
      skeleton={<MediaGridSkeleton count={pageSize} />}
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
