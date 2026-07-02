import type { MediaCardTooltipBatchQueryVariables } from "@/lib/anilist/generated/graphql";
import type { MediaCardTooltip } from "@/lib/anilist/domain/types";

/** Max media IDs per batched tooltip GraphQL request (one HTTP round-trip). */
export const TOOLTIP_BATCH_SIZE = 8;

/** Coalesce hover requests before flushing a batch to the server. */
export const TOOLTIP_BATCH_DEBOUNCE_MS = 48;

export const TOOLTIP_BATCH_ALIASES = ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"] as const;

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

/** Unused batch slots query a non-existent id so AniList still validates all 8 aliases. */
const TOOLTIP_BATCH_PADDING_ID = 0;

export function buildMediaCardTooltipBatchVariables(
  mediaIds: readonly number[],
): MediaCardTooltipBatchQueryVariables {
  const chunk = mediaIds.slice(0, TOOLTIP_BATCH_SIZE);

  return {
    id0: chunk[0] ?? TOOLTIP_BATCH_PADDING_ID,
    id1: chunk[1] ?? TOOLTIP_BATCH_PADDING_ID,
    id2: chunk[2] ?? TOOLTIP_BATCH_PADDING_ID,
    id3: chunk[3] ?? TOOLTIP_BATCH_PADDING_ID,
    id4: chunk[4] ?? TOOLTIP_BATCH_PADDING_ID,
    id5: chunk[5] ?? TOOLTIP_BATCH_PADDING_ID,
    id6: chunk[6] ?? TOOLTIP_BATCH_PADDING_ID,
    id7: chunk[7] ?? TOOLTIP_BATCH_PADDING_ID,
  };
}

type BatchMedia = {
  id?: number | null;
  isAdult?: boolean | null;
} & Partial<MediaCardTooltip>;

function normalizeBatchMedia(media: BatchMedia | null | undefined): MediaCardTooltip | null {
  if (!media?.id) {
    return null;
  }
  if (media.isAdult) {
    return null;
  }
  return media as MediaCardTooltip;
}

export function normalizeMediaCardTooltipBatch(
  mediaIds: readonly number[],
  data: Record<(typeof TOOLTIP_BATCH_ALIASES)[number], BatchMedia | null | undefined>,
): Map<number, MediaCardTooltip | null> {
  const result = new Map<number, MediaCardTooltip | null>();

  for (const [index, requestedId] of mediaIds.entries()) {
    const alias = TOOLTIP_BATCH_ALIASES[index];
    if (!alias) {
      break;
    }

    const media = data[alias];
    if (media?.id) {
      result.set(media.id, normalizeBatchMedia(media));
    } else {
      result.set(requestedId, null);
    }
  }

  return result;
}
