"use server";

import type { ReactNode } from "react";
import { MediaGrid } from "@/features/anime/components/media-grid";
import { getBrowseCollection } from "@/features/anime/anime-queries";
import type { AnimeCollection, AnimeFilters } from "@/features/anime/types/anime";

export type BrowsePage = { node: ReactNode; hasMore: boolean; hasItems: boolean };

export async function renderBrowsePage(
  collection: AnimeCollection,
  filters: AnimeFilters,
  page: number
): Promise<BrowsePage> {
  "use server";
  const { items, pageInfo } = await getBrowseCollection(collection, filters, page);
  const capped = collection === "top100" ? page * 25 <= 100 : true;
  return {
    hasMore: pageInfo.hasNextPage && capped,
    hasItems: items.length > 0,
    node: <MediaGrid items={items} />,
  };
}
