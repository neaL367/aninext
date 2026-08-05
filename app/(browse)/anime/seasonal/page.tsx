import type { Metadata } from "next";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { BrowsePageShell, BrowsePageResults } from "@/features/anime/components/browse-page-shell";
import { parseFilters } from "@/features/anime/lib/parse-filters";
import { getCollectionMetadata } from "@/features/anime/lib/collection-config";
import { getCurrentSeason } from "@/features/anime/lib/season";

export const prefetch = "partial";
export const instant = false;

export function generateMetadata(): Metadata {
  return getCollectionMetadata("seasonal");
}

export default async function SeasonalPage({
  searchParams,
}: PageProps<"/anime/seasonal">) {
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

  return (
    <BrowsePageShell collection="seasonal">
      <BrowsePageResults collection="seasonal" filters={filters} />
    </BrowsePageShell>
  );
}
