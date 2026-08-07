import { Suspense } from "react";

import { ErrorBoundary } from "@/components/ui/error-boundary";
import { HomeFeatured, HomeFeaturedSkeleton } from "@/features/anime/components/home-featured";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AniNext — Discover anime",
  description: "Discover what is airing, rising, and worth your next evening.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <ErrorBoundary title="Home failed to load">
      <Suspense fallback={<HomeFeaturedSkeleton />}>
        <HomeFeatured />
      </Suspense>
    </ErrorBoundary>
  );
}
