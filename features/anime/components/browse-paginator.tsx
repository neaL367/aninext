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
        skeleton={skeleton}
        emptyComponent={emptyComponent}
      />
    </Suspense>
  );
}

function BrowsePaginatorContent({
  initialPage,
  collection,
  filters,
  skeleton: _skeleton,
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
  "use memo";
  const initialResult = use(initialPage);
  const [pages, setPages] = useState<Promise<BrowsePage>[]>(() => [initialPage]);
  const [hasItems] = useState(initialResult.hasItems);

  const loadPage = useCallback(
    async (page: number) => {
      const result = await renderBrowsePage(collection, filters, page, pageSize);
      setPages((prev) => [...prev, Promise.resolve(result)]);
      return result;
    },
    [collection, filters, pageSize],
  );

  const { isPending, hasMore, loadMore } = useInfiniteScroll(loadPage, {
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
        <InfiniteScrollSentinel onLoadMore={loadMore} isLoading={isPending} />
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
  isLoading,
}: {
  onLoadMore: () => void;
  isLoading: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onLoadMore);

  useEffect(() => {
    callbackRef.current = onLoadMore;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el || isLoading) return;

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
  }, [isLoading]);

  return (
    <div
      ref={ref}
      className="flex items-center justify-center border-t border-border-soft py-8"
      aria-label="Load more anime"
    >
      {isLoading && <Spinner className="size-5" />}
    </div>
  );
}
