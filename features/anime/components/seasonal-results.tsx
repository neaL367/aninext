import { io } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentSeason } from "@/features/anime/lib/season";

import { BrowsePageResults } from "./browse-page-shell";
import { SeasonalDefault } from "./seasonal-default";

import type { AnimeFilters } from "@/features/anime/types/anime";

export async function SeasonalResults({
  season,
  year,
  filters,
}: {
  season?: string;
  year?: string;
  filters: AnimeFilters;
}) {
  await io();
  const current = getCurrentSeason();

  if (!season || !year) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (Array.isArray(value)) value.forEach((item) => params.append(key, item));
      else if (value !== undefined) params.set(key, String(value));
    }
    params.set("season", season ?? current.season);
    params.set("year", year ?? String(current.seasonYear));
    redirect(`/anime/seasonal?${params.toString()}`);
  }

  return (
    <>
      <SeasonalDefault
        urlSeason={season}
        urlYear={year}
        serverSeason={current.season}
        serverYear={current.seasonYear}
      />
      <BrowsePageResults collection="seasonal" filters={filters} />
    </>
  );
}
