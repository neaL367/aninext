"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import {
  consumeBrowseRestore,
  peekBrowseRestore,
  persistBrowseRestoreSnapshot,
  updateBrowseRestoreSnapshot,
} from "@/lib/navigation/browse-restore";
import {
  cancelScrollRestore,
  consumePendingScrollRestore,
  readCurrentHref,
} from "@/lib/navigation/scroll-restore";
import type { MediaPageResult } from "@/lib/anilist/domain/types";

type UseBrowseScrollRestoreProps = {
  pathname: string;
  filterKey: string;
  pages: any[];
  setPages: React.Dispatch<React.SetStateAction<MediaPageResult[]>>;
  onRestore: (scrollY: number, shouldResumeLoadMore: boolean) => void;
};

export function useBrowseScrollRestore({
  pathname,
  filterKey,
  pages,
  setPages,
  onRestore,
}: UseBrowseScrollRestoreProps) {
  const restoreAttemptedRef = useRef(false);
  const restoreWhenPageCountRef = useRef(0);
  const pendingScrollYRef = useRef<number | null>(null);
  const pendingResumeLoadMoreRef = useRef(false);

  const tryRestoreBrowse = useCallback(() => {
    if (pathname !== "/anime" || restoreAttemptedRef.current) {
      return;
    }

    const href = readCurrentHref();
    const peek = peekBrowseRestore(href);

    if (peek) {
      // Only mark as attempted if we actually consume the state or set up a pending restore
      if (pages.length >= peek.pages.length) {
        restoreAttemptedRef.current = true;
        const restored = consumeBrowseRestore(href);
        if (restored?.scrollY && restored.scrollY > 0) {
          onRestore(restored.scrollY, restored.wasNearBottom ?? false);
        }
        return;
      }

      // If we have a restore state but not enough pages yet, 
      // we don't mark restoreAttemptedRef.current = true yet,
      // so we can keep trying until pages.length is sufficient.
      const restored = consumeBrowseRestore(href);
      if (!restored) return;

      if (restored.pages.length > 0) {
        setPages(restored.pages);
        restoreWhenPageCountRef.current = restored.pages.length;
        pendingScrollYRef.current = restored.scrollY;
        pendingResumeLoadMoreRef.current = restored.wasNearBottom === true;
        return;
      }

      if (restored.scrollY > 0) {
        restoreAttemptedRef.current = true;
        onRestore(restored.scrollY, restored.wasNearBottom ?? false);
      }
      return;
    }

    const pendingScrollY = consumePendingScrollRestore(href);
    if (pendingScrollY != null && pendingScrollY > 0) {
      restoreAttemptedRef.current = true;
      onRestore(pendingScrollY, false);
    }
  }, [pathname, pages.length, onRestore, setPages]);


  useEffect(() => {
    if (pathname !== "/anime") {
      restoreAttemptedRef.current = false;
      cancelScrollRestore();
    }
  }, [pathname]);

  useLayoutEffect(() => {
    requestAnimationFrame(() => {
      tryRestoreBrowse();
    });
  }, [tryRestoreBrowse]);

  useEffect(() => {
    if (restoreWhenPageCountRef.current === 0) return;

    if (pages.length < restoreWhenPageCountRef.current) return;

    restoreWhenPageCountRef.current = 0;
    const scrollY = pendingScrollYRef.current;
    const shouldResumeLoadMore = pendingResumeLoadMoreRef.current;
    pendingScrollYRef.current = null;
    pendingResumeLoadMoreRef.current = false;

    if (scrollY != null && scrollY > 0) {
      onRestore(scrollY, shouldResumeLoadMore);
    }
  }, [pages.length, onRestore]);

  useEffect(() => {
    updateBrowseRestoreSnapshot(readCurrentHref(), filterKey, pages);
    persistBrowseRestoreSnapshot();
  }, [filterKey, pages]);

  useEffect(() => {
    const onPopState = () => {
      requestAnimationFrame(() => tryRestoreBrowse());
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [tryRestoreBrowse]);

  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) tryRestoreBrowse();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [tryRestoreBrowse]);
}
