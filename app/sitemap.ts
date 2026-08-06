import { COLLECTIONS } from "@/features/anime/lib/collection-config";

import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://ani-next.vercel.app";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "hourly", priority: 1 },
    { url: `${base}/airing`, lastModified: now, changeFrequency: "hourly", priority: 0.8 },
  ];

  const collectionRoutes: MetadataRoute.Sitemap = Object.keys(COLLECTIONS).map((collection) => ({
    url: `${base}/anime/${collection}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [...staticRoutes, ...collectionRoutes];
}
