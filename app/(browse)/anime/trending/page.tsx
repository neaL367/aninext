import { Suspense } from "react";

import { BrowsePageShell } from "@/features/anime/components/browse/browse-page-shell";
import { CollectionResults } from "@/features/anime/components/browse/collection-results";
import { MediaGridSkeleton } from "@/features/anime/components/browse/media-grid";
import { getCollectionMetadata } from "@/features/anime/lib/collection-config";
import { parseFilters } from "@/features/anime/lib/parse-filters";

import type { Metadata } from "next";

export function generateMetadata(): Metadata {
  return getCollectionMetadata("trending");
}

export default function TrendingPage({ searchParams }: PageProps<"/anime/trending">) {
  return (
    <BrowsePageShell collection="trending">
      <Suspense fallback={<MediaGridSkeleton count={20} />}>
        {searchParams.then((sp) => (
          <CollectionResults collection="trending" filters={parseFilters(sp)} />
        ))}
      </Suspense>
    </BrowsePageShell>
  );
}
