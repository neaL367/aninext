"use client";

import { Suspense, use, useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { Spinner } from "@/components/ui/spinner";
import { renderBrowsePage, type BrowsePage } from "@/features/anime/components/browse-page-action";
import { cn } from "@/lib/utils";

import { useInfiniteScroll } from "../hooks/use-infinite-scroll";
import { buildFilterHash } from "../lib/parse-filters";
import { MEDIA_GRID_CLASS, MediaGridSkeletonItems } from "./media-grid";

import type { AnimeCollection, AnimeFilters } from "@/features/anime/types/anime";

export function BrowsePaginator({
  initialPage,
  collection,
  filters,
  skeleton,
  pageSize,
  emptyComponent,
}: {
  initialPage: Promise<BrowsePage>;
  collection: AnimeCollection;
  filters: AnimeFilters;
  skeleton: ReactNode;
  pageSize: number;
  emptyComponent: ReactNode;
}) {
  return (
    <Suspense fallback={skeleton}>
      <BrowsePaginatorContent
        initialPage={initialPage}
        collection={collection}
        filters={filters}
        pageSize={pageSize}
        emptyComponent={emptyComponent}
      />
    </Suspense>
  );
}

function BrowsePaginatorContent({
  initialPage,
  collection,
  filters,
  pageSize,
  emptyComponent,
}: {
  initialPage: Promise<BrowsePage>;
  collection: AnimeCollection;
  filters: AnimeFilters;
  pageSize: number;
  emptyComponent: ReactNode;
}) {
  "use memo";
  const initialResult = use(initialPage);
  const [pages, setPages] = useState<Promise<BrowsePage>[]>(() => [initialPage]);
  const [hasItems] = useState(initialResult.hasItems);
  const loadedPagesRef = useRef(new Set([1]));
  const gridRef = useRef<HTMLDivElement>(null);
  const storageKey = `aninext:browse:${collection}:${buildFilterHash(filters)}`;

  // Restore target reads straight from storage on first render — no mount
  // effect (SSR/prerender has no sessionStorage, so it resolves to null).
  // Keyed by collection + filters, so a filter change starts fresh at page 1.
  // Capped so a corrupt entry can't trigger a refresh storm on degraded API.
  const [restoreState] = useState(() => {
    const saved = readBrowseState(storageKey);
    return {
      n:
        typeof saved.n === "number" && saved.n > 1
          ? Math.min(Math.floor(saved.n), MAX_RESTORE_PAGES)
          : null,
      y: typeof saved.y === "number" ? saved.y : 0,
    };
  });
  const restoreDone = useRef(false);
  const restoreAttempts = useRef(0);

  const loadPage = useCallback(
    async (page: number) => {
      const result = await renderBrowsePage(collection, filters, page, pageSize);
      if (!loadedPagesRef.current.has(page)) {
        loadedPagesRef.current.add(page);
        // setState after unmount is a silent no-op (React 18+); the dup guard
        // above is all the protection this needs.
        setPages((prev) => [...prev, Promise.resolve(result)]);
        // Persist depth at the moment it grows — an async event context, so no
        // effect needed. Pages load sequentially, so page number == count.
        writeBrowseState(storageKey, { n: page });
      }
      return result;
    },
    [collection, filters, pageSize, storageKey],
  );

  const { isPending, hasMore, error, loadMore, retry, syncPage } = useInfiniteScroll(loadPage, {
    initialHasMore: initialResult.hasMore,
    ...(collection === "top100" ? { maxItems: 100, itemsPerPage: pageSize } : {}),
  });

  // Chain direct loads until the restored depth is reached (or the list ends),
  // then jump to the saved position. Direct loadPage calls skip the scroll
  // cooldown: page data is cache-warm ('use cache' + SWR profiles), so each
  // page costs one fast roundtrip at natural pace instead of 800ms apart.
  // Cold-cache misses still fetch from AniList sequentially — safe under the
  // degraded limit. Owns manual scroll restoration while active so the
  // browser doesn't fight the progressive reload. Failures back off and
  // retry; after enough retries we finish partial — the sentinel's manual
  // retry stays as backup.
  const [restoreTick, setRestoreTick] = useState(0);
  const restoreBusy = useRef(false);
  useEffect(() => {
    if (restoreState.n === null || restoreDone.current) return;
    const setManual = () => {
      try {
        history.scrollRestoration = "manual";
      } catch {
        // ignore
      }
    };
    const setAuto = () => {
      try {
        history.scrollRestoration = "auto";
      } catch {
        // ignore
      }
    };
    const finish = () => {
      restoreDone.current = true;
      restoreBusy.current = false;
      syncPage(pages.length);
      if (restoreState.y > 0) window.scrollTo(0, restoreState.y);
      setAuto();
    };
    setManual();
    if (pages.length >= restoreState.n || !hasMore) {
      finish();
      return;
    }
    if (restoreBusy.current) return;
    restoreBusy.current = true;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    loadPage(pages.length + 1).then(
      () => {
        // Append changed pages.length, which retriggers this effect.
        if (!cancelled) restoreBusy.current = false;
      },
      () => {
        if (cancelled) return;
        restoreAttempts.current += 1;
        if (restoreAttempts.current > MAX_RESTORE_RETRIES) {
          restoreBusy.current = false;
          finish();
          return;
        }
        timer = setTimeout(() => {
          restoreBusy.current = false;
          setRestoreTick((t) => t + 1);
        }, RESTORE_RETRY_DELAY_MS);
      },
    );
    return () => {
      cancelled = true;
      restoreBusy.current = false;
      if (timer) clearTimeout(timer);
      setAuto();
    };
  }, [restoreState, pages.length, hasMore, loadPage, restoreTick, syncPage]);

  const pageSkeleton = (
    <MediaGridSkeletonItems count={pageSize} firstPage={false} />
  );

  return (
    <>
      <ResultsGrid containerRef={gridRef} storageKey={storageKey}>
        {pages.map((page, i) => (
          <Suspense key={i} fallback={pageSkeleton}>
            <PageContent page={page} />
          </Suspense>
        ))}
      </ResultsGrid>
      <PaginationRail pages={pages} hasMore={hasMore} containerRef={gridRef} />
      {!hasItems ? (
        emptyComponent
      ) : hasMore ? (
        <InfiniteScrollSentinel
          onLoadMore={loadMore}
          onRetry={retry}
          isLoading={isPending}
          error={error}
        />
      ) : (
        <p className="border-t border-border-soft py-8 text-center font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
          End of results
        </p>
      )}
    </>
  );
}

function ResultsGrid({
  children,
  containerRef,
  storageKey,
}: {
  children: ReactNode;
  containerRef: { current: HTMLDivElement | null };
  storageKey: string;
}) {
  // Scroll position saver rides on this permanently-mounted node via a ref
  // callback (React 19 cleanup) — a window subscription with no effect.
  const trackScrollRef = useCallback(
    (_node: HTMLDivElement | null) => {
      if (!_node) return;
      let raf = 0;
      const save = () => {
        raf = 0;
        writeBrowseState(storageKey, { y: window.scrollY });
      };
      const onScroll = () => {
        if (!raf) raf = requestAnimationFrame(save);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => {
        window.removeEventListener("scroll", onScroll);
        if (raf) cancelAnimationFrame(raf);
      };
    },
    [storageKey],
  );
  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      containerRef.current = node;
      return trackScrollRef(node);
    },
    [containerRef, trackScrollRef],
  );
  // Single shared grid so page N's first cards continue page N-1's last row.
  // Per-card content-visibility (see .cv-card) skips off-screen rendering.
  return (
    <div
      ref={mergedRef}
      className={cn(MEDIA_GRID_CLASS, "lg:mr-8")}
      role="list"
      aria-label="Anime results"
    >
      {children}
    </div>
  );
}

function PageContent({ page }: { page: Promise<BrowsePage> }) {
  const result = use(page);
  const { node } = result;
  return <>{node}</>;
}

const PAGINATION_HEADER_OFFSET = 80;
const MAX_RESTORE_PAGES = 25;
const MAX_RESTORE_RETRIES = 5;
const RESTORE_RETRY_DELAY_MS = 2500;

function readBrowseState(key: string): { n?: unknown; y?: unknown } {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null) return parsed;
    return {};
  } catch {
    return {};
  }
}

function writeBrowseState(key: string, patch: { n?: number; y?: number }) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ ...readBrowseState(key), ...patch }));
  } catch {
    // storage unavailable — restore just stays off
  }
}

/**
 * Floating vertical page-number pagination for infinite-scroll grids. One
 * numbered button per loaded page, fixed at the vertical middle of the right
 * edge. The active page is highlighted as you scroll; clicking a number
 * scrolls to that page's first card.
 */
function PaginationRail({
  pages,
  hasMore,
  containerRef,
}: {
  pages: Promise<BrowsePage>[];
  hasMore: boolean;
  containerRef: { current: HTMLDivElement | null };
}) {
  const [active, setActive] = useState(1);
  const pageCount = pages.length;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Active page = lowest page number with a card below the sticky-header
    // line. The shrunken root makes "intersecting" == "below the line", so no
    // rect reads are needed — just min over the visible set. Every card is
    // observed (not just page-first ones) so mid-page positions — e.g. right
    // after a restore jump — always resolve instead of freezing.
    const visible = new Set<number>();
    const observer = new IntersectionObserver(
      (entries) => {
        let changed = false;
        for (const entry of entries) {
          const n = Number((entry.target as HTMLElement).dataset.page);
          if (!Number.isSafeInteger(n)) continue;
          if (entry.isIntersecting) {
            if (!visible.has(n)) {
              visible.add(n);
              changed = true;
            }
          } else if (visible.delete(n)) {
            changed = true;
          }
        }
        // Empty = grid fully out of view: keep the previous highlight.
        if (!changed || visible.size === 0) return;
        const next = Math.min(...visible);
        setActive((prev) => (prev === next ? prev : next));
      },
      // Shrink the viewport to below the sticky header so exits/entries fire
      // exactly when a card crosses the header line.
      { rootMargin: `-${PAGINATION_HEADER_OFFSET + 1}px 0px 0px 0px`, threshold: 0 },
    );
    // Re-observe helper: Suspense resolutions swap skeleton nodes for real
    // cards without changing `pages`, which would otherwise orphan the
    // observation set (stale highlight until the next manual scroll).
    let raf = 0;
    const observeAll = () => {
      raf = 0;
      observer.disconnect();
      visible.clear();
      el.querySelectorAll("[data-page]").forEach((c) => observer.observe(c));
    };
    observeAll();
    const mo = new MutationObserver(() => {
      if (!raf) raf = requestAnimationFrame(observeAll);
    });
    mo.observe(el, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      observer.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
    // pages identity (not just length): backfill swaps replace skeleton nodes
    // with real cards, which must be (re-)observed to keep the highlight live.
  }, [containerRef, pages]);

  if (!hasMore && pageCount <= 1) return null;

  const scrollToPage = (page: number) => {
    // First match is the page's first card.
    const target = containerRef.current?.querySelector(`[data-page="${page}"]`);
    if (!target) return;
    const y = target.getBoundingClientRect().top + window.scrollY - PAGINATION_HEADER_OFFSET;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const markers: Array<number | "gap"> = [];
  if (pageCount <= 7) {
    for (let p = 1; p <= pageCount; p += 1) markers.push(p);
  } else {
    markers.push(1);
    const start = Math.max(2, active - 1);
    const end = Math.min(pageCount - 1, active + 1);
    if (start > 2) markers.push("gap");
    for (let p = start; p <= end; p += 1) markers.push(p);
    if (end < pageCount - 1) markers.push("gap");
    markers.push(pageCount);
  }

  return (
    <nav
      className="fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-1 lg:flex"
      aria-label="Results pages"
    >
      {markers.map((marker, i) =>
        marker === "gap" ? (
          <span
            key={`gap-${i}`}
            className="flex size-6 items-center justify-center font-mono text-[0.6rem] leading-none text-muted-foreground/50"
          >
            …
          </span>
        ) : (
          <button
            key={marker}
            type="button"
            onClick={() => scrollToPage(marker)}
            aria-label={`Go to page ${marker}`}
            aria-current={marker === active ? "true" : undefined}
            className={cn(
              "flex size-6 cursor-pointer items-center justify-center rounded-full font-mono text-[0.65rem] font-semibold tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal",
              marker === active
                ? "bg-signal text-white shadow-[0_0_0_3px_var(--signal-soft)]"
                : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
            )}
          >
            {marker}
          </button>
        ),
      )}
    </nav>
  );
}

function InfiniteScrollSentinel({
  onLoadMore,
  onRetry,
  isLoading,
  error,
}: {
  onLoadMore: () => void;
  onRetry: () => void;
  isLoading: boolean;
  error: unknown;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Latest-callback ref assigned during render (docs-blessed pattern) — the
  // observer effect below never re-subscribes just for callback identity.
  const callbackRef = useRef(onLoadMore);
  callbackRef.current = onLoadMore;

  useEffect(() => {
    const el = ref.current;
    if (!el || isLoading || error) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          callbackRef.current();
        }
      },
      { rootMargin: "600px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [error, isLoading]);

  return (
    <div
      ref={ref}
      className="flex items-center justify-center border-t border-border-soft py-8"
      aria-label="Load more anime"
    >
      {error ? (
        <div className="flex items-center gap-3" role="alert">
          <span className="text-sm text-muted-foreground">Couldn&apos;t load more anime.</span>
          <button
            type="button"
            onClick={onRetry}
            className="cursor-pointer font-mono text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-signal hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          >
            Try again
          </button>
        </div>
      ) : (
        isLoading && <Spinner className="size-5" />
      )}
    </div>
  );
}
