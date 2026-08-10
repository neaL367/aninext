"use client";

import { Suspense, use, useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { Spinner } from "@/components/ui/spinner";
import { renderBrowsePage, type BrowsePage } from "@/features/anime/components/browse-page-action";

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
      <ResultsGrid>
        {pages.map((page, i) => (
          <Suspense key={i} fallback={pageSkeleton}>
            <PageContent page={page} />
          </Suspense>
        ))}
      </ResultsGrid>
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

function ResultsGrid({ children }: { children: ReactNode }) {
  return (
    <div className={MEDIA_GRID_CLASS} role="list" aria-label="Anime results">
      {children}
    </div>
  );
}

function PageContent({ page }: { page: Promise<BrowsePage> }) {
  const result = use(page);
  const { node } = result;
  return <>{node}</>;
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
