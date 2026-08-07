import { Suspense } from "react";

import { BrowsePageShell } from "@/features/anime/components/browse-page-shell";
import { CollectionResults } from "@/features/anime/components/collection-results";
import { MediaGridSkeleton } from "@/features/anime/components/media-grid";
import { getCollectionMetadata } from "@/features/anime/lib/collection-config";
import { parseFilters } from "@/features/anime/lib/parse-filters";

import type { Metadata } from "next";

export function generateMetadata(): Metadata {
  return getCollectionMetadata("popular");
}

export default function PopularPage({ searchParams }: PageProps<"/anime/popular">) {
  return (
    <BrowsePageShell collection="popular">
      <Suspense fallback={<MediaGridSkeleton count={20} />}>
        {searchParams.then((sp) => (
          <CollectionResults collection="popular" filters={parseFilters(sp)} />
        ))}
      </Suspense>
    </BrowsePageShell>
  );
}
