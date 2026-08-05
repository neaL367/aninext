import type { Metadata } from "next";
import { connection } from "next/server";
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
  return (
    <BrowsePageShell collection="seasonal">
      {searchParams.then(async (sp) => {
        const filters = parseFilters(sp as Record<string, string | string[] | undefined>);
        if (!filters.season || !filters.year) {
          await connection();
          const current = getCurrentSeason();
          if (!filters.season) filters.season = current.season;
          if (!filters.year) filters.year = current.seasonYear;
        }
        return <BrowsePageResults collection="seasonal" filters={filters} />;
      })}
    </BrowsePageShell>
  );
}
