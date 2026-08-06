"use client";

import { Suspense, use, useEffect, useState, useTransition, type ReactNode } from "react";

import { Crossfade } from "@/components/crossfade";

import { BrowseGrid } from "./browse-grid";
import { renderBrowsePage, type BrowsePage } from "./browse-page-action";
import { InfiniteScrollSentinel } from "./infinite-scroll-sentinel";

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
      <BrowseGrid>
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
      </BrowseGrid>
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
