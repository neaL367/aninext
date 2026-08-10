"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";

const LOAD_COOLDOWN_MS = 500;

type InfiniteScrollOptions = {
  maxItems?: number;
  itemsPerPage?: number;
  initialHasMore?: boolean;
};

export function useInfiniteScroll<T>(
  loadPage: (page: number) => Promise<T | void>,
  opts: InfiniteScrollOptions = {},
) {
  const [isPending, startTransition] = useTransition();
  const [hasMore, setHasMore] = useState(opts.initialHasMore ?? true);
  const [error, setError] = useState<unknown>(null);
  const loadingRef = useRef(false);
  const mountedRef = useRef(true);
  const lastLoadRef = useRef(0);
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pageRef = useRef(1);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
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

    const nextPage = pageRef.current + 1;
    if (opts.maxItems && opts.itemsPerPage && nextPage * opts.itemsPerPage > opts.maxItems) {
      if (mountedRef.current) setHasMore(false);
      return;
    }

    lastLoadRef.current = now;
    pageRef.current = nextPage;
    loadingRef.current = true;
    if (mountedRef.current) setError(null);

    startTransition(async () => {
      try {
        const result = await loadPage(nextPage);
        if (!mountedRef.current) return;

        if (result && typeof result === "object" && "hasMore" in result) {
          setHasMore((result as { hasMore: boolean }).hasMore);
        }
      } catch (cause) {
        // Keep the failed page available for retry instead of skipping it on
        // the next intersection or retry attempt.
        pageRef.current = nextPage - 1;
        if (mountedRef.current) setError(cause);
      } finally {
        loadingRef.current = false;
      }
    });
  }, [hasMore, loadPage, opts.itemsPerPage, opts.maxItems, startTransition]);

  const retry = useCallback(() => {
    if (mountedRef.current) setError(null);
    loadMore();
  }, [loadMore]);

  return { isPending, hasMore, error, setHasMore, loadMore, retry };
}
