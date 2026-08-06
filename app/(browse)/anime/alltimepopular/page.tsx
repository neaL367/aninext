import { Suspense } from "react";
import type { Metadata } from "next";
import { BrowsePageShell, BrowsePageResults } from "@/features/anime/components/browse/browse-page-shell";
import { parseFilters } from "@/features/anime/lib/parse-filters";
import { getCollectionMetadata } from "@/features/anime/lib/collection-config";
import { AnimeResultsSkeleton } from "@/features/anime/components/browse/anime-results";

export function generateMetadata(): Metadata {
  return getCollectionMetadata("alltimepopular");
}

export default function AllTimePopularPage({
  searchParams,
}: PageProps<"/anime/alltimepopular">) {
  return (
    <BrowsePageShell collection="alltimepopular">
      <Suspense fallback={<AnimeResultsSkeleton count={20} />}>
        <AllTimePopularResults searchParams={searchParams} />
      </Suspense>
    </BrowsePageShell>
  );
}

async function AllTimePopularResults({
  searchParams,
}: Pick<PageProps<"/anime/alltimepopular">, "searchParams">) {
  const sp = await searchParams;
  const filters = parseFilters(sp as Record<string, string | string[] | undefined>);
  return <BrowsePageResults collection="alltimepopular" filters={filters} />;
}
