import { AnimePreviewCard } from "@/features/anime/components/anime-preview-card";
import { MediaCard, MediaCardSkeleton } from "@/features/anime/components/media-card";
import { cn } from "@/lib/utils";

import type { Media } from "@/features/anime/types/anime";

export const MEDIA_GRID_CLASS =
  "grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5";

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
        const isFeatured = firstPage && (i === 0 || i === 12) && !rankStart;
        const isAboveFold = i < 4;
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
          <div
            key={item.id}
            role="listitem"
            className={cn("cv-card", isFeatured ? "col-span-2 md:col-span-2" : undefined)}
            data-page={page}
          >
            <AnimePreviewCard media={item}>
              <MediaCard
                media={item}
                size={isFeatured ? "featured" : "default"}
                rank={rankStart !== undefined ? rankStart + i : undefined}
                viewTransition={canMorph}
                priority={eager}
              />
            </AnimePreviewCard>
          </div>
        );
      })}
    </>
  );
}

export function MediaGridSkeleton({
  count = 20,
  rankStart,
}: {
  count?: number;
  rankStart?: number;
}) {
  return (
    <div className={MEDIA_GRID_CLASS} role="list" aria-label="Loading anime results">
      <MediaGridSkeletonItems count={count} rankStart={rankStart} />
    </div>
  );
}

export function MediaGridSkeletonItems({
  count = 20,
  rankStart,
  firstPage = true,
}: {
  count?: number;
  rankStart?: number;
  firstPage?: boolean;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const isFeatured = firstPage && (i === 0 || i === 12) && !rankStart;
        return (
          <div
            key={i}
            role="listitem"
            className={isFeatured ? "col-span-2 md:col-span-2" : undefined}
          >
            <MediaCardSkeleton size={isFeatured ? "featured" : "default"} />
          </div>
        );
      })}
    </>
  );
}
