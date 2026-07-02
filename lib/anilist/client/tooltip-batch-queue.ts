"use client";

import { TOOLTIP_BATCH_DEBOUNCE_MS, TOOLTIP_BATCH_SIZE } from "@/lib/anilist/domain/tooltip-batch";
import type { MediaCardTooltip } from "@/lib/anilist/domain/types";
import { getMediaCardTooltipsBatchAction } from "@/lib/anilist/server/actions";

type TooltipWaiter = {
  resolve: (value: MediaCardTooltip | null) => void;
  reject: (reason: unknown) => void;
};

const waiters = new Map<number, TooltipWaiter[]>();
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let flushChain: Promise<void> = Promise.resolve();

export function enqueueTooltipBatch(mediaId: number): Promise<MediaCardTooltip | null> {
  return new Promise((resolve, reject) => {
    const pending = waiters.get(mediaId) ?? [];
    pending.push({ resolve, reject });
    waiters.set(mediaId, pending);
    scheduleFlush();
  });
}

function scheduleFlush() {
  if (debounceTimer) {
    return;
  }

  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    flushChain = flushChain.then(flushUntilEmpty);
  }, TOOLTIP_BATCH_DEBOUNCE_MS);
}

async function flushUntilEmpty() {
  while (waiters.size > 0) {
    await flushOneBatch();
  }
}

async function flushOneBatch() {
  const mediaIds = [...waiters.keys()].slice(0, TOOLTIP_BATCH_SIZE);
  if (mediaIds.length === 0) {
    return;
  }

  const batchWaiters = mediaIds.map((mediaId) => ({
    mediaId,
    callbacks: waiters.get(mediaId) ?? [],
  }));

  for (const mediaId of mediaIds) {
    waiters.delete(mediaId);
  }

  try {
    const result = await getMediaCardTooltipsBatchAction(mediaIds);

    for (const { mediaId, callbacks } of batchWaiters) {
      if (result.ok) {
        const tooltip = result.data[mediaId] ?? null;
        for (const { resolve } of callbacks) {
          resolve(tooltip);
        }
        continue;
      }

      const error = new Error(result.message);
      for (const { reject } of callbacks) {
        reject(error);
      }
    }
  } catch (error) {
    for (const { callbacks } of batchWaiters) {
      for (const { reject } of callbacks) {
        reject(error);
      }
    }
  }
}
