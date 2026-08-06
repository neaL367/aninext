import { Suspense } from "react";
import type { Metadata } from "next";
import { BrowsePageShell } from "@/features/anime/components/browse/browse-page-shell";
import { SeasonalResults } from "@/features/anime/components/browse/seasonal-results";
import { getCollectionMetadata } from "@/features/anime/lib/collection-config";
import { AnimeResultsSkeleton } from "@/features/anime/components/browse/anime-results";

export function generateMetadata(): Metadata {
  return getCollectionMetadata("seasonal");
}

export default function SeasonalPage({ searchParams }: PageProps<"/anime/seasonal">) {
  return (
    <BrowsePageShell collection="seasonal">
      <Suspense fallback={<AnimeResultsSkeleton count={20} />}>
        <SeasonalResults searchParams={searchParams} />
      </Suspense>
    </BrowsePageShell>
  );
}
