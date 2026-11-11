import { COLLECTIONS } from "@/features/anime/lib/collection-config";

import type { MetadataRoute } from "next";

// No `new Date()` here: it turned the route dynamic, so every crawler hit
// rendered it. Without it the sitemap is static output.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://ani-next.vercel.app";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "hourly", priority: 1 },
    { url: `${base}/airing`, changeFrequency: "hourly", priority: 0.8 },
  ];

  const collectionRoutes: MetadataRoute.Sitemap = Object.keys(COLLECTIONS).map((collection) => ({
    url: `${base}/anime/${collection}`,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [...staticRoutes, ...collectionRoutes];
}
