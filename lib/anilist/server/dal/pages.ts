"use server";

import { MediaPageDocument, GlobalSearchDocument, type MediaPageQueryVariables } from "@/lib/anilist/generated/graphql";
import { normalizeMediaPageResult, type GlobalSearchResult } from "@/lib/anilist/domain/types";
import { executeGraphQL } from "@/lib/anilist/infra/graphql-client";

export async function getMediaPage(variables: MediaPageQueryVariables) {
  "use cache";
  if (process.env.NODE_ENV === "development") {
    console.log(`[dal-cache] executing getMediaPage with vars:`, JSON.stringify(variables));
  }
  const data = await executeGraphQL(MediaPageDocument, variables);
  return normalizeMediaPageResult(data);
}

export async function getGlobalSearch(query: string): Promise<GlobalSearchResult[]> {
  "use cache";
  if (!query.trim()) return [];

  const result = await executeGraphQL(GlobalSearchDocument, { search: query });

  const results: GlobalSearchResult[] = [];

  result.anime?.media?.forEach((m) => results.push({ type: 'anime', data: m }));
  result.manga?.media?.forEach((m) => results.push({ type: 'manga', data: m }));
  result.characters?.characters?.forEach((c) => results.push({ type: 'character', data: c }));
  result.staff?.staff?.forEach((s) => results.push({ type: 'staff', data: s }));

  return results;
}
