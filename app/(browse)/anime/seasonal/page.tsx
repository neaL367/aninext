import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { BrowsePageShell, BrowsePageResults } from "@/features/anime/components/browse-page-shell";
import { parseFilters } from "@/features/anime/lib/parse-filters";
import { getCollectionMetadata } from "@/features/anime/lib/collection-config";
import { getCurrentSeason } from "@/features/anime/lib/season";
import { SeasonalDefaultSync } from "@/features/anime/components/seasonal-default-sync";
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
  await connection();
  const current = getCurrentSeason();
  const season = sp.season ?? current.season;
  const year = sp.year ?? String(current.seasonYear);
  const filters = parseFilters({ ...sp, season, year } as Record<string, string | string[] | undefined>);

  return (
    <>
      <SeasonalDefaultSync current={current} />
      <BrowsePageResults collection="seasonal" filters={filters} />
    </>
  );
}
