import { Suspense } from "react";

import { AnimeResultsSkeleton } from "@/features/anime/components/browse/anime-results";
import { BrowsePageShell } from "@/features/anime/components/browse/browse-page-shell";
import { CollectionResults } from "@/features/anime/components/browse/collection-results";
import { getCollectionMetadata } from "@/features/anime/lib/collection-config";

import type { Metadata } from "next";

export function generateMetadata(): Metadata {
  return getCollectionMetadata("upcoming");
}

export default function UpcomingPage({ searchParams }: PageProps<"/anime/upcoming">) {
  return (
    <BrowsePageShell collection="upcoming">
      <Suspense fallback={<AnimeResultsSkeleton count={20} />}>
        <CollectionResults collection="upcoming" searchParams={searchParams} />
      </Suspense>
    </BrowsePageShell>
  );
}
