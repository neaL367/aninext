import type { MediaCardTooltipBatchQueryVariables } from "@/lib/anilist/generated/graphql";
import type { MediaCardTooltip } from "@/lib/anilist/domain/types";

/** Max media IDs per batched tooltip GraphQL request (one HTTP round-trip). */
export const TOOLTIP_BATCH_SIZE = 20;

/** Coalesce hover requests before flushing a batch to the server. */
export const TOOLTIP_BATCH_DEBOUNCE_MS = 48;

export type TooltipBatchCacheVars = {
  idsKey: string;
};

export function tooltipBatchIdsKey(mediaIds: readonly number[]): string {
  return [...new Set(mediaIds)].sort((a, b) => a - b).join(",");
}

export function chunkTooltipBatchIds(mediaIds: readonly number[]): number[][] {
  const unique = [...new Set(mediaIds)].sort((a, b) => a - b);
  const chunks: number[][] = [];

  for (let index = 0; index < unique.length; index += TOOLTIP_BATCH_SIZE) {
    chunks.push(unique.slice(index, index + TOOLTIP_BATCH_SIZE));
  }

  return chunks;
}

type BatchMedia = {
  id?: number | null;
} & Partial<MediaCardTooltip>;

function normalizeBatchMedia(media: BatchMedia | null | undefined): MediaCardTooltip | null {
  if (!media?.id) {
    return null;
  }
  return media as MediaCardTooltip;
}

export function buildMediaCardTooltipBatchVariables(
  mediaIds: readonly number[],
): MediaCardTooltipBatchQueryVariables {
  return {
    ids: [...mediaIds],
  };
}

export function normalizeMediaCardTooltipBatch(
  mediaIds: readonly number[],
  data: any,
): Map<number, MediaCardTooltip | null> {
  const result = new Map<number, MediaCardTooltip | null>();
  const mediaList = data?.Page?.media ?? [];

  for (const media of mediaList) {
    if (media?.id) {
      result.set(media.id, normalizeBatchMedia(media));
    }
  }

  for (const id of mediaIds) {
    if (!result.has(id)) {
      result.set(id, null);
    }
  }

  return result;
}
