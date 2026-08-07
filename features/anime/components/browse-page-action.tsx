"use server";

import { io } from "next/cache";

import { getBrowseCollection } from "@/features/anime/anime-queries";
import { MediaGrid } from "@/features/anime/components/media-grid";
import { getCurrentSeason } from "@/features/anime/lib/season";

import type { AnimeCollection, AnimeFilters } from "@/features/anime/types/anime";
import type { ReactNode } from "react";

export type BrowsePage = { node: ReactNode; hasMore: boolean; hasItems: boolean };

export async function renderBrowsePage(
  collection: AnimeCollection,
  filters: AnimeFilters,
  page: number,
  perPage: number,
): Promise<BrowsePage> {
  await io();
  const isTop100 = collection === "top100";
  if (isTop100 && page * perPage > 100) {
    return { hasMore: false, hasItems: false, node: <MediaGrid items={[]} /> };
  }

  const currentSeason = collection === "popular" ? getCurrentSeason() : undefined;
  const { items, pageInfo } = await getBrowseCollection(
    collection,
    filters,
    page,
    perPage,
    currentSeason,
  );
  const visibleItems = isTop100 ? items.slice(0, 100 - (page - 1) * perPage) : items;
  const canLoadNextPage = !isTop100 || (page + 1) * perPage <= 100;
  const rankStart =
    collection === "top100" && !filters.search ? (page - 1) * perPage + 1 : undefined;
  return {
    hasMore: pageInfo.hasNextPage && canLoadNextPage,
    hasItems: visibleItems.length > 0,
    node: <MediaGrid items={visibleItems} rankStart={rankStart} priorityFirst={page === 1} />,
  };
}
