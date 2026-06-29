import { cache } from "react";
import type { QueryClient } from "@tanstack/react-query";
import { getHomeSections } from "@/lib/anilist/server/get-home-sections";
import { seedHomeSectionQueries } from "@/lib/anilist/query-options";

/** Seed React Query with all home carousel sections (one GraphQL request). */
export const prefetchHomeSections = cache(async (queryClient: QueryClient) => {
  const sections = await getHomeSections();
  seedHomeSectionQueries(queryClient, sections);
});
