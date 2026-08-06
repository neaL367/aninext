import { Suspense } from "react";
import type { Metadata } from "next";
import { BrowsePageShell, BrowsePageResults } from "@/features/anime/components/browse-page-shell";
import { parseFilters } from "@/features/anime/lib/parse-filters";
import { getCollectionMetadata } from "@/features/anime/lib/collection-config";
import { AnimeResultsSkeleton } from "@/features/anime/components/anime-results";

export function generateMetadata(): Metadata {
  return getCollectionMetadata("top100");
}

export default function Top100Page({
  searchParams,
}: PageProps<"/anime/top100">) {
  return (
    <BrowsePageShell collection="top100">
      <Suspense fallback={<AnimeResultsSkeleton count={20} />}>
        <Top100Results searchParams={searchParams} />
      </Suspense>
    </BrowsePageShell>
  );
}

async function Top100Results({
  searchParams,
}: Pick<PageProps<"/anime/top100">, "searchParams">) {
  const sp = await searchParams;
  const filters = parseFilters(sp as Record<string, string | string[] | undefined>);
  return <BrowsePageResults collection="top100" filters={filters} />;
}
