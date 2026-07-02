"use client";

import { useEffect, useState } from "react";
import { enqueueTooltipBatch } from "@/lib/anilist/client/tooltip-batch-queue";
import type { MediaCardTooltip } from "@/lib/anilist/domain/types";

const tooltipCache = new Map<number, MediaCardTooltip | null>();

export function useMediaCardTooltip(mediaId: number, enabled: boolean) {
  const cached = tooltipCache.get(mediaId);
  const [data, setData] = useState<MediaCardTooltip | null | undefined>(cached);
  const [isPending, setIsPending] = useState(enabled && cached === undefined);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (tooltipCache.has(mediaId)) {
      setData(tooltipCache.get(mediaId));
      setIsPending(false);
      setIsError(false);
      return;
    }

    let cancelled = false;
    setIsPending(true);
    setIsError(false);

    void enqueueTooltipBatch(mediaId).then(
      (tooltip) => {
        if (cancelled) {
          return;
        }

        setIsPending(false);
        tooltipCache.set(mediaId, tooltip);
        setData(tooltip);
      },
      () => {
        if (cancelled) {
          return;
        }

        setIsPending(false);
        setIsError(true);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [enabled, mediaId]);

  return { data, isPending, isError };
}
