import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { GenreCollectionDocument } from "@/lib/anilist/generated/graphql";
import { anilistCacheLife } from "@/lib/anilist/server/cache-policy";
import { anilistCacheTags } from "@/lib/anilist/server/cache-tags";
import type { GenreOption } from "@/lib/anilist/domain/genres";
import { executeGraphQL } from "@/lib/anilist/infra/graphql-client";

export async function getGenreCollection(): Promise<GenreOption[]> {
  "use cache";
  cacheLife(anilistCacheLife.genreCollection);
  cacheTag(anilistCacheTags.genres);

  const data = await executeGraphQL(GenreCollectionDocument, {});
  return (data.GenreCollection ?? [])
    .filter((name): name is string => Boolean(name))
    .map((name, index) => ({ id: index, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
