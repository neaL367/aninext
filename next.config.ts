import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  typedRoutes: true,
  reactStrictMode: true,
  reactCompiler: {
    compilationMode: "annotation",
  },
  images: {
    unoptimized: true,
    remotePatterns: [{ hostname: "s4.anilist.co", protocol: "https" }],
  },
  cacheLife: {
    // Degraded upstream (30 req/min): serve stale instantly, refresh in
    // background. Wider revalidate/expire windows avoid blocking misses while
    // background refresh keeps data fresh. Restore tighter windows when full
    // rate limit returns.
    trending: { stale: 300, revalidate: 1800, expire: 7200 },
    home: { stale: 300, revalidate: 1800, expire: 86400 },
    static: { stale: 3600, revalidate: 21600, expire: 604800 },
    airing: { stale: 300, revalidate: 1800, expire: 7200 },
    max: { stale: 86400, revalidate: 604800, expire: 1209600 },
  },
  experimental: {
    useTypeScriptCli: true,
    useOffline: true,
    exposeTestingApiInProductionBuild: true,
    inlineCss: true,
    turbopackRustReactCompiler: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
