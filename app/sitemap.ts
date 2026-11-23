import { getBrowseCollection } from "@/features/anime/anime-queries";
import { COLLECTIONS } from "@/features/anime/lib/collection-config";

import type { MetadataRoute } from "next";

// No `new Date()` here: it turned the route dynamic, so every crawler hit
// rendered it. Everything below comes from cached queries, so the sitemap is
// still static output.
const BASE = "https://ani-next.vercel.app";

// One file holds 50k URLs, but crawling budget is the real limit: a few hundred
// of the pages people actually land on beats thousands of unseen ones.
const DETAIL_LIMIT = 300;

/**
 * Detail pages worth submitting. Until now the sitemap listed only the eight
 * static routes, so every /anime/<id> was discoverable by link-following alone —
 * which is also how crawlers ended up wandering the long tail.
 */
async function detailIds(): Promise<number[]> {
  const ids = new Set<number>();
  const collect = (items: { id: number }[] | undefined) => {
    for (const item of items ?? []) ids.add(item.id);
  };

  // Highest rated of all time, most popular ever, what is trending and what is
  // coming — the sets that cover most search demand for a title page. Every read
  // goes through a cached query; calling a time-reading helper out here would
  // make this route dynamic and hand crawlers a render per request.
  const lists = await Promise.all([
    getBrowseCollection("top100", {}, 1, 50),
    getBrowseCollection("top100", {}, 2, 50),
    getBrowseCollection("alltimepopular", {}, 1, 50),
    getBrowseCollection("alltimepopular", {}, 2, 50),
    getBrowseCollection("trending", {}, 1, 50),
    getBrowseCollection("upcoming", {}, 1, 50),
  ]);
  for (const list of lists) collect(list.items);

  return [...ids];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, changeFrequency: "hourly", priority: 1 },
    { url: `${BASE}/airing`, changeFrequency: "hourly", priority: 0.8 },
  ];

  const collectionRoutes: MetadataRoute.Sitemap = Object.keys(COLLECTIONS).map((collection) => ({
    url: `${BASE}/anime/${collection}`,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  let detailRoutes: MetadataRoute.Sitemap = [];
  try {
    detailRoutes = (await detailIds()).slice(0, DETAIL_LIMIT).map((id) => ({
      url: `${BASE}/anime/${id}`,
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  } catch {
    // A build-time outage must not fail the build or ship an empty sitemap:
    // fall back to the routes that need no data.
  }

  return [...staticRoutes, ...collectionRoutes, ...detailRoutes];
}
