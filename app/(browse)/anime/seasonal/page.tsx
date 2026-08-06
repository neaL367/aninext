import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { BrowsePageShell, BrowsePageResults } from "@/features/anime/components/browse-page-shell";
import { parseFilters } from "@/features/anime/lib/parse-filters";
import { getCollectionMetadata } from "@/features/anime/lib/collection-config";
import { getCurrentSeason } from "@/features/anime/lib/season";
import { AnimeResultsSkeleton } from "@/features/anime/components/anime-results";

export function generateMetadata(): Metadata {
  return getCollectionMetadata("seasonal");
}

export default function SeasonalPage({
  searchParams,
}: PageProps<"/anime/seasonal">) {
  return (
    <BrowsePageShell collection="seasonal">
      <Suspense fallback={<AnimeResultsSkeleton count={20} />}>
        <SeasonalResults searchParams={searchParams} />
      </Suspense>
    </BrowsePageShell>
  );
}

async function SeasonalResults({
  searchParams,
}: Pick<PageProps<"/anime/seasonal">, "searchParams">) {
  const sp = await searchParams;

  if (!sp.season || !sp.year) {
    await connection();
    const current = getCurrentSeason();
    const params = new URLSearchParams(sp as Record<string, string>);
    if (!sp.season) params.set("season", current.season);
    if (!sp.year) params.set("year", String(current.seasonYear));
    redirect(`/anime/seasonal?${params.toString()}`);
  }

  const filters = parseFilters(sp as Record<string, string | string[] | undefined>);

  return <BrowsePageResults collection="seasonal" filters={filters} />;
}
