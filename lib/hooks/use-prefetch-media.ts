"use client";

import { useRef } from "react";
import { prefetchMediaDetailAction } from "@/lib/anilist/server/actions";

/**
 * Hook to trigger a server-side prefetch of media details when a user hovers.
 * Uses a small delay to prevent "drive-by" prefetches when the mouse just passes over.
 */
export function usePrefetchMedia(mediaId: number) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const prefetch = async () => {
    if (timerRef.current) return;

    timerRef.current = setTimeout(async () => {
      try {
        await prefetchMediaDetailAction(mediaId);
      } catch (e) {
        // Silent fail for prefetches
      } finally {
        timerRef.current = null;
      }
    }, 80); // 80ms delay to ensure intentional hover
  };

  const cancel = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return { prefetch, cancel };
}
