import { AnimePreviewCard } from "@/features/anime/components/anime-preview-card";
import { MediaCard, MediaCardSkeleton } from "@/features/anime/components/media-card";

import type { Media } from "@/features/anime/types/anime";

export function MediaGrid({
  items,
  rankStart,
  priorityFirst = false,
}: {
  items: Media[];
  rankStart?: number;
  priorityFirst?: boolean;
}) {
  return (
    <>
      {items.map((item, i) => {
        const isFeatured = (i === 0 || i === 12) && !rankStart;
        return (
          <div key={item.id} role="listitem" className={isFeatured ? "col-span-2 md:col-span-2" : undefined}>
            <AnimePreviewCard media={item}>
              <MediaCard
                media={item}
                size={isFeatured ? "featured" : "default"}
                rank={rankStart !== undefined ? rankStart + i : undefined}
                viewTransition
                priority={priorityFirst && i === 0}
              />
            </AnimePreviewCard>
          </div>
        );
      })}
    </>
  );
}

export function MediaGridSkeleton({ count = 20 }: { count?: number }) {
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
