import { BrowsePageResults } from "./browse-page-shell";

import type { AnimeCollection, AnimeFilters } from "@/features/anime/types/anime";

export async function CollectionResults({
  collection,
  filters,
}: {
  collection: AnimeCollection;
  filters: AnimeFilters;
}) {
  return <BrowsePageResults collection={collection} filters={filters} />;
}
