"use client";

import { Suspense, use, useEffect, useRef, useState, useTransition, type ReactNode } from "react";

import { Crossfade } from "@/components/ui/crossfade";
import { Spinner } from "@/components/ui/spinner";
import { renderBrowsePage, type BrowsePage } from "@/features/anime/anime-actions";

import type { AnimeCollection, AnimeFilters } from "@/features/anime/types/anime";

export function BrowsePaginator({
  initialPage,
  collection,
  filters,
  skeleton,
  emptyComponent,
}: {
  initialPage: Promise<BrowsePage>;
  collection: AnimeCollection;
  filters: AnimeFilters;
  skeleton: ReactNode;
  emptyComponent: ReactNode;
}) {
  const [pages, setPages] = useState([initialPage]);
  const [isPending, startTransition] = useTransition();
  const [hasMore, setHasMore] = useState(true);
  const [hasItems, setHasItems] = useState(true);

  function loadMore() {
    if (!hasMore) return;
    const nextPage = pages.length + 1;
    startTransition(async () => {
      const result = await renderBrowsePage(collection, filters, nextPage);
      setHasMore(result.hasMore);
      setPages((prev) => [...prev, Promise.resolve(result)]);
    });
  }

  return (
    <>
      <div
        className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
        role="list"
        aria-label="Anime results"
      >
        {pages.map((page, i) => (
          <Suspense key={i} fallback={skeleton}>
            {i === 0 ? (
              <PageContent page={page} onResolved={setHasItems} />
            ) : (
              <Crossfade>
                <PageContent page={page} onResolved={() => undefined} />
              </Crossfade>
            )}
          </Suspense>
        ))}
      </div>
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

function PageContent({
  page,
  onResolved,
}: {
  page: Promise<BrowsePage>;
  onResolved: (hasItems: boolean) => void;
}) {
  const result = use(page);
  useEffect(() => {
    onResolved(result.hasItems);
  }, [onResolved, result.hasItems]);
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
