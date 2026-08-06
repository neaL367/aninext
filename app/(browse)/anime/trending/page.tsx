import { Suspense } from "react";
import type { Metadata } from "next";
import { BrowsePageShell, BrowsePageResults } from "@/features/anime/components/browse-page-shell";
import { parseFilters } from "@/features/anime/lib/parse-filters";
import { getCollectionMetadata } from "@/features/anime/lib/collection-config";
import { AnimeResultsSkeleton } from "@/features/anime/components/anime-results";

export function generateMetadata(): Metadata {
  return getCollectionMetadata("trending");
}

export default function TrendingPage({
  searchParams,
}: PageProps<"/anime/trending">) {
  return (
    <BrowsePageShell collection="trending">
      <Suspense fallback={<AnimeResultsSkeleton count={20} />}>
        <TrendingResults searchParams={searchParams} />
      </Suspense>
    </BrowsePageShell>
  );
}

async function TrendingResults({
  searchParams,
}: Pick<PageProps<"/anime/trending">, "searchParams">) {
  const sp = await searchParams;
  const filters = parseFilters(sp as Record<string, string | string[] | undefined>);
  return <BrowsePageResults collection="trending" filters={filters} />;
}
