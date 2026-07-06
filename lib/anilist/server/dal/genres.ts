"use server";

import { GenreCollectionDocument } from "@/lib/anilist/generated/graphql";
import type { GenreOption } from "@/lib/anilist/domain/genres";
import { executeGraphQL } from "@/lib/anilist/infra/graphql-client";

function normalizeGenreCollection(data: {
  GenreCollection?: (string | null)[] | null;
}): GenreOption[] {
  return (data.GenreCollection ?? [])
    .filter((name): name is string => Boolean(name))
    .map((name, index) => ({ id: index, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getGenreCollection(): Promise<GenreOption[]> {
  "use cache";
  const data = await executeGraphQL(GenreCollectionDocument, {});
  return normalizeGenreCollection(data);
}
