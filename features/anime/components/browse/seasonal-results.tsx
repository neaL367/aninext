import { redirect } from "next/navigation";
import { connection } from "next/server";

import { parseFilters } from "@/features/anime/lib/parse-filters";
import { getCurrentSeason } from "@/features/anime/lib/season";

import { BrowsePageResults } from "./browse-page-shell";

export async function SeasonalResults({
  searchParams,
}: Pick<PageProps<"/anime/seasonal">, "searchParams">) {
  const sp = await searchParams;
  await connection();

  if (!sp.season || !sp.year) {
    const current = getCurrentSeason();
    const params = new URLSearchParams(sp as Record<string, string>);
    if (!sp.season) params.set("season", current.season);
    if (!sp.year) params.set("year", String(current.seasonYear));
    redirect(`/anime/seasonal?${params.toString()}`);
  }

  const filters = parseFilters(sp);

  return <BrowsePageResults collection="seasonal" filters={filters} />;
}
