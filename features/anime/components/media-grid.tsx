import { MediaCard, MediaCardSkeleton } from "@/features/anime/components/media-card";

import type { Media } from "@/features/anime/types/anime";

export const MEDIA_GRID_CLASS =
  "grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 xl:grid-cols-5";

export function MediaGrid({
  items,
  rankStart,
  firstPage = true,
  page,
}: {
  items: Media[];
  rankStart?: number;
  // Featured (2-column) cards only belong on the first page — on later pages
  // they can't fit the partial last row of the previous page and leave a hole
  // in the grid (the "missing card" at the infinite-scroll join).
  firstPage?: boolean;
  // Page number stamped on every card so the pagination rail can tell which
  // page is under the sticky-header line without scanning rects.
  page?: number;
}) {
  "use memo";
  return (
    <>
      {items.map((item, i) => {
        const isAboveFold = i < 6;
        // Eager-load only the first page's top cards. Pages 2+ stay lazy —
        // `priority` forces eager fetch + preload, which would stall the
        // current viewport with off-screen covers on long scrolls.
        const eager = firstPage && isAboveFold;
        // Only the first page's top cards morph into the detail hero. Limiting
        // to a single page avoids duplicate <ViewTransition> names when AniList's
        // live sorts shift an item across a page boundary during infinite scroll.
        const canMorph =
          firstPage && (isAboveFold || (rankStart !== undefined && rankStart + i <= 6));
        return (
          <div key={item.id} role="listitem" className="cv-card" data-page={page}>
            <MediaCard
              media={item}
              rank={rankStart !== undefined ? rankStart + i : undefined}
              viewTransition={canMorph}
              priority={eager}
            />
          </div>
        );
      })}
    </>
  );
}

export function MediaGridSkeleton({ count = 20 }: { count?: number }) {
  return (
    <div className={MEDIA_GRID_CLASS} role="list" aria-label="Loading anime results">
      <MediaGridSkeletonItems count={count} />
    </div>
  );
}

export function MediaGridSkeletonItems({ count = 20 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} role="listitem">
          <MediaCardSkeleton />
        </div>
      ))}
    </>
  );
}
