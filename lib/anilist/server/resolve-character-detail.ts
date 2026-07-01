import "server-only";

import { formatPersonName } from "@/lib/anilist/display/format";
import { createSlugDetailResolver } from "@/lib/anilist/server/create-slug-detail-resolver";
import { getCharacterDetail } from "@/lib/anilist/server/get-character-detail";
import { characterDetailPath } from "@/lib/navigation/detail-paths";

export const resolveCharacterDetail = createSlugDetailResolver({
  fetch: getCharacterDetail,
  getSlugName: (character) => formatPersonName(character.name),
  getCanonicalPath: (character, slugName) => characterDetailPath(character.id, slugName),
});
