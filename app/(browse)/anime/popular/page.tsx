import { Suspense } from "react";
import type { Metadata } from "next";
import { BrowsePageShell, BrowsePageResults } from "@/features/anime/components/browse-page-shell";
import { parseFilters } from "@/features/anime/lib/parse-filters";
import { getCollectionMetadata } from "@/features/anime/lib/collection-config";
import { AnimeResultsSkeleton } from "@/features/anime/components/anime-results";

export function generateMetadata(): Metadata {
  return getCollectionMetadata("popular");
}

export default function PopularPage({
  searchParams,
}: PageProps<"/anime/popular">) {
  return (
    <BrowsePageShell collection="popular">
      <Suspense fallback={<AnimeResultsSkeleton count={20} />}>
        <PopularResults searchParams={searchParams} />
      </Suspense>
    </BrowsePageShell>
  );
}

async function PopularResults({
  searchParams,
}: Pick<PageProps<"/anime/popular">, "searchParams">) {
  const sp = await searchParams;
  const filters = parseFilters(sp as Record<string, string | string[] | undefined>);
  return <BrowsePageResults collection="popular" filters={filters} />;
}
