import type { Media } from "@/features/anime/types/anime";
import { MediaCard, MediaCardSkeleton } from "@/features/anime/components/home/media-card";
import { AnimePreviewCard } from "@/features/anime/components/anime-preview-card";

export function MediaGrid({ items, rankStart }: { items: Media[]; rankStart?: number }) {
  return (
    <>
      {items.map((item, i) => (
        <div key={item.id} role="listitem">
          <AnimePreviewCard media={item}>
            <MediaCard media={item} rank={rankStart !== undefined ? rankStart + i : undefined} viewTransition vtIndex={(rankStart ?? 0) + i} priority={i === 0} />
          </AnimePreviewCard>
        </div>
      ))}
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
