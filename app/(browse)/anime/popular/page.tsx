import { Suspense } from "react";

import { AnimeResultsSkeleton } from "@/features/anime/components/browse/anime-results";
import { BrowsePageShell } from "@/features/anime/components/browse/browse-page-shell";
import { CollectionResults } from "@/features/anime/components/browse/collection-results";
import { getCollectionMetadata } from "@/features/anime/lib/collection-config";

import type { Metadata } from "next";

export function generateMetadata(): Metadata {
  return getCollectionMetadata("popular");
}

export default function PopularPage({ searchParams }: PageProps<"/anime/popular">) {
  return (
    <BrowsePageShell collection="popular">
      <Suspense fallback={<AnimeResultsSkeleton count={20} />}>
        <CollectionResults collection="popular" searchParams={searchParams} />
      </Suspense>
    </BrowsePageShell>
  );
}
