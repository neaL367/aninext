"use server";

import { checkBotId } from "botid/server";
import { io } from "next/cache";
import { headers } from "next/headers";

import { getBrowseCollection } from "@/features/anime/anime-queries";
import { MediaGrid } from "@/features/anime/components/media-grid";
import { getCurrentSeason } from "@/features/anime/lib/season";

import type { AnimeCollection, AnimeFilters } from "@/features/anime/types/anime";
import type { ReactNode } from "react";

export type BrowsePage = { node: ReactNode; hasMore: boolean; hasItems: boolean };

// Protect the only non-GET endpoint the site has. BotID is fail-open on
// purpose: a missing verdict (local dev, non-Vercel hosting, cached client
// bundle without the challenge) must never stop a real reader from loading the
// next page, so only a positive "this is a bot" classification refuses.
async function assertNotBot(): Promise<void> {
  // The same function also runs during the initial server render of the
  // collection page, where there is no BotID challenge on the request. Only a
  // Server Action POST carries the next-action header, so check that request.
  const requestHeaders = await headers();
  if (!requestHeaders.has("next-action")) return;

  let isBot = false;
  try {
    isBot = (await checkBotId()).isBot;
  } catch {
    // No verdict available (local development, non-Vercel host, missing OIDC
    // token): fail open so a reader can still load the next page.
    return;
  }
  if (isBot) throw new Error("Too many requests");
}

export async function renderBrowsePage(
  collection: AnimeCollection,
  filters: AnimeFilters,
  page: number,
  perPage: number,
): Promise<BrowsePage> {
  await assertNotBot();
  await io();
  const isTop100 = collection === "top100";

  // Top 100 pages like every other collection. The old full-100 snapshot cost
  // ~155 KB in two requests on first paint for a list most visitors never
  // scroll past the first screen of.
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
    node: (
      <MediaGrid items={visibleItems} rankStart={rankStart} firstPage={page === 1} page={page} />
    ),
  };
}
