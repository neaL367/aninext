"use server";

import { HomePageSectionsDocument } from "@/lib/anilist/generated/graphql";
import { normalizeHomePageSections } from "@/lib/anilist/domain/normalize-home-page-sections";
import { getCurrentAnimeSeason, getNextAnimeSeason } from "@/lib/anilist/domain/season";
import type { MediaSeason } from "@/lib/anilist/domain/types";
import { buildHomePageSectionVariables } from "@/lib/browse/anilist-queries";
import { executeGraphQL } from "@/lib/anilist/infra/graphql-client";
import { connection } from "next/server";

async function fetchHomePageSections(current: MediaSeason, yearCurrent: number, next: MediaSeason, yearNext: number) {
  "use cache";
  const data = await executeGraphQL(
    HomePageSectionsDocument,
    buildHomePageSectionVariables({ season: current, year: yearCurrent }, { season: next, year: yearNext }),
  );
  return normalizeHomePageSections(data);
}

export async function getHomePageSections() {
  await connection();
  const current = getCurrentAnimeSeason();
  const next = getNextAnimeSeason();
  
  return fetchHomePageSections(
    current.season, 
    current.year, 
    next.season, 
    next.year
  );
}
