import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  typedRoutes: true,
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [{ hostname: "s4.anilist.co", protocol: "https" }],
  },
  cacheLife: {
    trending: { stale: 60, revalidate: 300, expire: 3600 },
    home: { stale: 300, revalidate: 900, expire: 86400 },
    static: { stale: 3600, revalidate: 21600, expire: 604800 },
  },
  experimental: {
    useTypeScriptCli: true,
    useOffline: true,
  },
};

export default nextConfig;
