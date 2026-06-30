import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { CharacterDetailDocument } from "@/lib/anilist/generated/graphql";
import { executeGraphQL } from "@/lib/anilist/infra/graphql-client";
import { anilistCacheLife } from "@/lib/anilist/server/cache-policy";
import { anilistCacheTags } from "@/lib/anilist/server/cache-tags";
import {
  normalizeCharacterDetail,
  type CharacterDetail,
} from "@/lib/anilist/domain/types";

export async function getCachedCharacterDetail(
  characterId: number
): Promise<CharacterDetail | null> {
  "use cache";

  cacheLife(anilistCacheLife.characterDetail);
  cacheTag(anilistCacheTags.characterDetail(characterId));

  const data = await executeGraphQL(CharacterDetailDocument, { id: characterId });
  return normalizeCharacterDetail(data);
}
