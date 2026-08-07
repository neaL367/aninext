"use client";

import { Suspense, use, useEffect, useRef, useState, useTransition, type ReactNode } from "react";

import { Spinner } from "@/components/ui/spinner";
import { renderBrowsePage, type BrowsePage } from "@/features/anime/components/browse-page-action";

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
    <Suspense fallback={<ResultsGrid>{skeleton}</ResultsGrid>}>
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
  const initialResult = use(initialPage);
  const [pages, setPages] = useState<Promise<BrowsePage>[]>(() => [initialPage]);
  const [isPending, startTransition] = useTransition();
  const [hasMore, setHasMore] = useState(initialResult.hasMore);
  const [hasItems] = useState(initialResult.hasItems);
  const loadingRef = useRef(false);
  const lastLoadRef = useRef(0);

  function loadMore() {
    if (!hasMore || loadingRef.current) return;
    const now = Date.now();
    if (now - lastLoadRef.current < 500) return;
    lastLoadRef.current = now;

    const nextPage = pages.length + 1;
    if (collection === "top100" && nextPage * pageSize > 100) {
      setHasMore(false);
      return;
    }

    loadingRef.current = true;
    startTransition(async () => {
      try {
        const result = await renderBrowsePage(collection, filters, nextPage, pageSize);
        setHasMore(result.hasMore);
        setPages((prev) => [...prev, Promise.resolve(result)]);
      } finally {
        loadingRef.current = false;
      }
    });
  }

  return (
    <>
      <ResultsGrid>
        {pages.map((page, i) => (
          <Suspense key={i} fallback={skeleton}>
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
    <div
      className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
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
