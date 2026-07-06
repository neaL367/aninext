import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  typedRoutes: true,
  logging: {
    fetches: {
      fullUrl: true,
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
