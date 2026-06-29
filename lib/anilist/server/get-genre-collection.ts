import { cacheLife, cacheTag } from "next/cache";
import { GenreCollectionDocument } from "@/lib/anilist/generated/graphql";
import { anilistCacheTags } from "@/lib/anilist/server/cache-tags";
import { executeGraphQL } from "@/lib/anilist/graphql-client";

export type GenreOption = { id: number; name: string };

export async function getGenreCollection(): Promise<GenreOption[]> {
  "use cache";
  cacheLife("days");
  cacheTag(anilistCacheTags.genres);

  const data = await executeGraphQL(GenreCollectionDocument, {});
  return (data.GenreCollection ?? [])
    .filter((name): name is string => Boolean(name))
    .map((name, index) => ({ id: index, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
