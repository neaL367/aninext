"use client";

import { Suspense, use, useEffect, useState, useTransition, type ReactNode } from "react";
import { Crossfade } from "@/components/crossfade";
import { InfiniteScrollSentinel } from "./infinite-scroll-sentinel";
import { renderBrowsePage, type BrowsePage } from "./browse-page-action";
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
      {!hasItems ? (
        emptyComponent
      ) : hasMore ? (
        <InfiniteScrollSentinel onLoadMore={loadMore} isLoading={isPending} />
      ) : (
        <p className="py-8 text-center text-sm text-muted-foreground">
          You've reached the end
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
