import { Suspense } from "react";
import type { Metadata } from "next";
import { BrowsePageShell, BrowsePageResults } from "@/features/anime/components/browse/browse-page-shell";
import { parseFilters } from "@/features/anime/lib/parse-filters";
import { getCollectionMetadata } from "@/features/anime/lib/collection-config";
import { AnimeResultsSkeleton } from "@/features/anime/components/browse/anime-results";

export function generateMetadata(): Metadata {
  return getCollectionMetadata("upcoming");
}

export default function UpcomingPage({
  searchParams,
}: PageProps<"/anime/upcoming">) {
  return (
    <BrowsePageShell collection="upcoming">
      <Suspense fallback={<AnimeResultsSkeleton count={20} />}>
        <UpcomingResults searchParams={searchParams} />
      </Suspense>
    </BrowsePageShell>
  );
}

async function UpcomingResults({
  searchParams,
}: Pick<PageProps<"/anime/upcoming">, "searchParams">) {
  const sp = await searchParams;
  const filters = parseFilters(sp as Record<string, string | string[] | undefined>);
  return <BrowsePageResults collection="upcoming" filters={filters} />;
}
