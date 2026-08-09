"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";

const LOAD_COOLDOWN_MS = 500;

export function useInfiniteScroll<T>(
  loadPage: (page: number) => Promise<T | void>,
  opts?: { maxItems?: number; itemsPerPage?: number },
) {
  const [isPending, startTransition] = useTransition();
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef(false);
  const lastLoadRef = useRef(0);
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pageRef = useRef(1);

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    };
  }, []);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingRef.current) return;
    const now = Date.now();
    const elapsed = now - lastLoadRef.current;
    if (elapsed < LOAD_COOLDOWN_MS) {
      if (!cooldownTimerRef.current) {
        cooldownTimerRef.current = setTimeout(() => {
          cooldownTimerRef.current = null;
          loadMore();
        }, LOAD_COOLDOWN_MS - elapsed);
      }
      return;
    }
    lastLoadRef.current = now;
    pageRef.current += 1;

    if (
      opts?.maxItems &&
      opts?.itemsPerPage &&
      pageRef.current * opts.itemsPerPage > opts.maxItems
    ) {
      setHasMore(false);
      return;
    }

    loadingRef.current = true;
    startTransition(async () => {
      try {
        const result = await loadPage(pageRef.current);
        if (result && typeof result === "object" && "hasMore" in result) {
          setHasMore((result as { hasMore: boolean }).hasMore);
        }
      } finally {
        loadingRef.current = false;
      }
    });
  }, [hasMore, loadPage, opts?.maxItems, opts?.itemsPerPage, startTransition]);

  return { isPending, hasMore, setHasMore, loadMore };
}
