import "server-only";

import { cache } from "react";
import { getCachedCharacterDetail } from "@/lib/anilist/server/get-cached-character-detail";

export const getCharacterDetail = cache(async (characterId: number) => {
  return getCachedCharacterDetail(characterId);
});
