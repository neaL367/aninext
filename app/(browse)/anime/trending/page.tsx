import { Suspense } from "react";
import type { Metadata } from "next";
import { BrowsePageShell } from "@/features/anime/components/browse/browse-page-shell";
import { CollectionResults } from "@/features/anime/components/browse/collection-results";
import { AnimeResultsSkeleton } from "@/features/anime/components/browse/anime-results";
import { getCollectionMetadata } from "@/features/anime/lib/collection-config";

export function generateMetadata(): Metadata {
  return getCollectionMetadata("trending");
}

export default function TrendingPage({ searchParams }: PageProps<"/anime/trending">) {
  return (
    <BrowsePageShell collection="trending">
      <Suspense fallback={<AnimeResultsSkeleton count={20} />}>
        <CollectionResults collection="trending" searchParams={searchParams} />
      </Suspense>
    </BrowsePageShell>
  );
}
