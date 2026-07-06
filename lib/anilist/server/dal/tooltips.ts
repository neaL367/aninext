"use server";

import { MediaCardTooltipBatchDocument } from "@/lib/anilist/generated/graphql";
import { 
  buildMediaCardTooltipBatchVariables, 
  normalizeMediaCardTooltipBatch 
} from "@/lib/anilist/domain/tooltip-batch";
import { executeGraphQL } from "@/lib/anilist/infra/graphql-client";

export async function getMediaCardTooltipBatch(mediaIds: number[]) {
  "use cache";
  const data = await executeGraphQL(
    MediaCardTooltipBatchDocument,
    buildMediaCardTooltipBatchVariables(mediaIds),
  );
  return normalizeMediaCardTooltipBatch(mediaIds, data);
}
