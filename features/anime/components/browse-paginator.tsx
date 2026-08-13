"use client";

import { Suspense, use, useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { Spinner } from "@/components/ui/spinner";
import { renderBrowsePage, type BrowsePage } from "@/features/anime/components/browse-page-action";
import { cn } from "@/lib/utils";

import { useInfiniteScroll } from "../hooks/use-infinite-scroll";
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
  const mountedRef = useRef(true);
  const loadedPagesRef = useRef(new Set([1]));
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadPage = useCallback(
    async (page: number) => {
      const result = await renderBrowsePage(collection, filters, page, pageSize);
      if (mountedRef.current && !loadedPagesRef.current.has(page)) {
        loadedPagesRef.current.add(page);
        setPages((prev) => [...prev, Promise.resolve(result)]);
      }
      return result;
    },
    [collection, filters, pageSize],
  );

  const { isPending, hasMore, error, loadMore, retry } = useInfiniteScroll(loadPage, {
    initialHasMore: initialResult.hasMore,
    ...(collection === "top100" ? { maxItems: 100, itemsPerPage: pageSize } : {}),
  });

  const pageSkeleton = (
    <MediaGridSkeletonItems
      count={pageSize}
      rankStart={collection === "top100" ? 1 : undefined}
      firstPage={false}
    />
  );

  return (
    <>
      <ResultsGrid containerRef={gridRef}>
        {pages.map((page, i) => (
          <Suspense key={i} fallback={pageSkeleton}>
            <PageContent page={page} />
          </Suspense>
        ))}
      </ResultsGrid>
      <PaginationRail
        pageCount={pages.length}
        hasMore={hasMore}
        pageSize={pageSize}
        containerRef={gridRef}
      />
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
}: {
  children: ReactNode;
  containerRef: { current: HTMLDivElement | null };
}) {
  return (
    <div
      ref={containerRef}
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

/**
 * Floating vertical page-number pagination for infinite-scroll grids. One
 * numbered button per loaded page, fixed at the vertical middle of the right
 * edge. The active page is highlighted as you scroll; clicking a number
 * scrolls to that page's first card.
 */
function PaginationRail({
  pageCount,
  hasMore,
  pageSize,
  containerRef,
}: {
  pageCount: number;
  hasMore: boolean;
  pageSize: number;
  containerRef: { current: HTMLDivElement | null };
}) {
  const [active, setActive] = useState(1);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = containerRef.current;
      if (!el) return;
      const items = el.querySelectorAll('[role="listitem"]');
      const threshold = window.scrollY + PAGINATION_HEADER_OFFSET;
      let current = 1;
      for (let i = 0; i < items.length; i += 1) {
        const top = items[i].getBoundingClientRect().top + window.scrollY;
        if (top <= threshold) {
          current = Math.min(pageCount, Math.floor(i / pageSize) + 1);
        } else {
          break;
        }
      }
      setActive(current);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [containerRef, pageCount, pageSize]);

  if (!hasMore && pageCount <= 1) return null;

  const scrollToPage = (page: number) => {
    const el = containerRef.current;
    const items = el?.querySelectorAll('[role="listitem"]');
    const target = items?.[(page - 1) * pageSize];
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
              "flex size-6 items-center justify-center rounded-full font-mono text-[0.65rem] font-semibold tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal",
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
  const callbackRef = useRef(onLoadMore);

  useEffect(() => {
    callbackRef.current = onLoadMore;
  });

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
            className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-signal hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
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
