import { AnimePreviewCard } from "@/features/anime/components/anime-preview-card";
import { MediaCard, MediaCardSkeleton } from "@/features/anime/components/media-card";

import type { Media } from "@/features/anime/types/anime";

export const MEDIA_GRID_CLASS =
  "grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5";

export function MediaGrid({
  items,
  rankStart,
  priorityFirst = false,
  firstPage = true,
}: {
  items: Media[];
  rankStart?: number;
  priorityFirst?: boolean;
  // Featured (2-column) cards only belong on the first page — on later pages
  // they can't fit the partial last row of the previous page and leave a hole
  // in the grid (the "missing card" at the infinite-scroll join).
  firstPage?: boolean;
}) {
  "use memo";
  return (
    <>
      {items.map((item, i) => {
        const isFeatured = firstPage && (i === 0 || i === 12) && !rankStart;
        const isAboveFold = i < 4;
        return (
          <div
            key={item.id}
            role="listitem"
            className={isFeatured ? "col-span-2 md:col-span-2" : undefined}
          >
            <AnimePreviewCard media={item}>
              <MediaCard
                media={item}
                size={isFeatured ? "featured" : "default"}
                rank={rankStart !== undefined ? rankStart + i : undefined}
                viewTransition
                priority={priorityFirst || isAboveFold}
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
