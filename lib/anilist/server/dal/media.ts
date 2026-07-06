"use server";

import { MediaDetailDocument } from "@/lib/anilist/generated/graphql";
import { normalizeMediaDetail } from "@/lib/anilist/domain/types";
import { executeGraphQL } from "@/lib/anilist/infra/graphql-client";

export async function getMediaDetail(mediaId: number) {
  "use cache";
  const data = await executeGraphQL(MediaDetailDocument, { id: mediaId });
  return normalizeMediaDetail(data);
}
