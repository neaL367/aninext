import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  typedRoutes: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  cacheLife: {
    // Genre list — practically static; AniList adds new genres a few times a year.
    anilistGenres: {
      stale: 60 * 60, // 1 hour
      revalidate: 60 * 60 * 24 * 7, // 1 week
      expire: 60 * 60 * 24 * 30, // 30 days
    },
    // Home carousels (trending, seasonal, airing-now) — rankings shift as episodes air.
    anilistHomeSection: {
      stale: 60 * 5, // 5 minutes
      revalidate: 60 * 60, // 1 hour
      expire: 60 * 60 * 6, // 6 hours
    },
    // Browse listing pages — same shape as home carousels, keyed per filter combo.
    anilistMediaPage: {
      stale: 60 * 5, // 5 minutes
      revalidate: 60 * 60, // 1 hour
      expire: 60 * 60 * 6, // 6 hours
    },
    // Anime/manga detail — synopsis/studios are static, but score/status/popularity drift.
    anilistMediaDetail: {
      stale: 60 * 10, // 10 minutes
      revalidate: 60 * 60 * 6, // 6 hours
      expire: 60 * 60 * 24 * 3, // 3 days
    },
    // Character/staff bios — near-immutable once published.
    anilistPersonDetail: {
      stale: 60 * 60, // 1 hour
      revalidate: 60 * 60 * 24 * 3, // 3 days
      expire: 60 * 60 * 24 * 14, // 14 days
    },
    // Card hover tooltips — small payload, safe to refresh often.
    anilistTooltip: {
      stale: 60 * 5, // 5 minutes
      revalidate: 60 * 60, // 1 hour
      expire: 60 * 60 * 6, // 6 hours
    },
    // Airing schedule — fetched one full week at a time, so we can afford to
    // revalidate more often than the raw call volume would otherwise allow.
    anilistAiringSchedule: {
      stale: 60 * 5, // 5 minutes
      revalidate: 60 * 30, // 30 minutes
      expire: 60 * 60 * 12, // 12 hours
    },
  },
  reactCompiler: {
    compilationMode: "annotation",
  },
  experimental: {
    inlineCss: true,
    useLightningcss: true,
    lightningCssFeatures: {
      include: ["oklab-colors", "hex-alpha-colors"],
    },
    turbopackFileSystemCacheForDev: true,
    turbopackMemoryEviction: "full",
    turbopackFileSystemCacheForBuild: true,
    turbopackRustReactCompiler: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s4.anilist.co",
        pathname: "/file/anilistcdn/**",
      },
    ],
  },
};

export default nextConfig;
