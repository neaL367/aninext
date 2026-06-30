import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  typedRoutes: true,
  reactCompiler: {
    compilationMode: "annotation",
  },
  experimental: {
    inlineCss: true,
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
