"use server";

import { CharacterDetailDocument, StaffDetailDocument } from "@/lib/anilist/generated/graphql";
import { normalizeCharacterDetail, normalizeStaffDetail } from "@/lib/anilist/domain/types";
import { executeGraphQL } from "@/lib/anilist/infra/graphql-client";

export async function getCharacterDetail(characterId: number) {
  "use cache";
  const data = await executeGraphQL(CharacterDetailDocument, { id: characterId });
  return normalizeCharacterDetail(data);
}

export async function getStaffDetail(staffId: number) {
  "use cache";
  const data = await executeGraphQL(StaffDetailDocument, { id: staffId });
  return normalizeStaffDetail(data);
}
