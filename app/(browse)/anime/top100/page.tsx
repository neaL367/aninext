import { Suspense } from "react";
import type { Metadata } from "next";
import { BrowsePageShell } from "@/features/anime/components/browse/browse-page-shell";
import { CollectionResults } from "@/features/anime/components/browse/collection-results";
import { AnimeResultsSkeleton } from "@/features/anime/components/browse/anime-results";
import { getCollectionMetadata } from "@/features/anime/lib/collection-config";

export function generateMetadata(): Metadata {
  return getCollectionMetadata("top100");
}

export default function Top100Page({ searchParams }: PageProps<"/anime/top100">) {
  return (
    <BrowsePageShell collection="top100">
      <Suspense fallback={<AnimeResultsSkeleton count={20} />}>
        <CollectionResults collection="top100" searchParams={searchParams} />
      </Suspense>
    </BrowsePageShell>
  );
}
