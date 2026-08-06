import { parseFilters } from "@/features/anime/lib/parse-filters";

import { BrowsePageResults } from "./browse-page-shell";

import type { AnimeCollection } from "@/features/anime/types/anime";

export async function CollectionResults({
  collection,
  searchParams,
}: {
  collection: AnimeCollection;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filters = parseFilters(sp);
  return <BrowsePageResults collection={collection} filters={filters} />;
}
