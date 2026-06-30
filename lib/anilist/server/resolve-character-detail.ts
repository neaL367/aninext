import "server-only";

import { permanentRedirect } from "next/navigation";
import { notFound } from "next/navigation";
import { cache } from "react";
import { formatPersonName } from "@/lib/anilist/display/format";
import { matchesDetailSlug } from "@/lib/anilist/display/media-links";
import type { SlugDetailParams } from "@/lib/anilist/domain/detail-route-params";
import { getCharacterDetail } from "@/lib/anilist/server/get-character-detail";
import { parseDetailId } from "@/lib/anilist/server/parse-detail-id";
import { characterDetailPath } from "@/lib/navigation/detail-paths";

export const resolveCharacterDetail = cache(async (params: SlugDetailParams) => {
  const { id, slug } = await params;
  const characterId = parseDetailId(id);
  const character = await getCharacterDetail(characterId);

  if (!character) {
    notFound();
  }

  const name = formatPersonName(character.name);
  const canonicalPath = characterDetailPath(character.id, name);

  if (!matchesDetailSlug(name, slug)) {
    permanentRedirect(canonicalPath);
  }

  return character;
});
