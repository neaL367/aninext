"use server";

import { getBrowseCollection } from "@/features/anime/anime-queries";
import { MediaGrid } from "@/features/anime/components/browse/media-grid";

import type { AnimeCollection, AnimeFilters } from "@/features/anime/types/anime";
import type { ReactNode } from "react";

export type BrowsePage = { node: ReactNode; hasMore: boolean; hasItems: boolean };

export async function renderBrowsePage(
  collection: AnimeCollection,
  filters: AnimeFilters,
  page: number,
): Promise<BrowsePage> {
  const perPage = 25;
  const { items, pageInfo } = await getBrowseCollection(collection, filters, page, perPage);
  const capped = collection === "top100" ? page * perPage <= 100 : true;
  const rankStart =
    collection === "top100" && !filters.search ? (page - 1) * perPage + 1 : undefined;
  return {
    hasMore: pageInfo.hasNextPage && capped,
    hasItems: items.length > 0,
    node: <MediaGrid items={items} rankStart={rankStart} />,
  };
}
