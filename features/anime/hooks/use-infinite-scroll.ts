"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";

const LOAD_COOLDOWN_MS = 800;

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
  const lastLoadRef = useRef(0);
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pageRef = useRef(1);

  // Only the cooldown timer needs unmount cleanup. State updates after
  // unmount are silent no-ops (React 18+), so no mounted guard is needed.
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

    const nextPage = pageRef.current + 1;
    if (opts.maxItems && opts.itemsPerPage && nextPage * opts.itemsPerPage > opts.maxItems) {
      setHasMore(false);
      return;
    }

    lastLoadRef.current = now;
    pageRef.current = nextPage;
    loadingRef.current = true;
    setError(null);

    startTransition(async () => {
      try {
        const result = await loadPage(nextPage);

        if (result && typeof result === "object" && "hasMore" in result) {
          setHasMore((result as { hasMore: boolean }).hasMore);
        }
      } catch (cause) {
        // Keep the failed page available for retry instead of skipping it on
        // the next intersection or retry attempt.
        pageRef.current = nextPage - 1;
        setError(cause);
      } finally {
        loadingRef.current = false;
      }
    });
  }, [hasMore, loadPage, opts.itemsPerPage, opts.maxItems, startTransition]);

  const retry = useCallback(() => {
    setError(null);
    loadMore();
  }, [loadMore]);

  // Fast-forward the page cursor when pages were filled outside loadMore
  // (restore path) so the sentinel continues after them instead of
  // re-walking already-loaded pages.
  const syncPage = useCallback((page: number) => {
    pageRef.current = Math.max(pageRef.current, page);
  }, []);

  return { isPending, hasMore, error, setHasMore, loadMore, retry, syncPage };
}
