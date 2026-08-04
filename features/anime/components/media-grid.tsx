import type { Media } from "@/features/anime/types/anime";
import { MediaCard, MediaCardSkeleton } from "./media-card";

export function MediaGrid({ items }: { items: Media[] }) {
  return (
    <div
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-5"
      role="list"
      aria-label="Anime results"
    >
      {items.map((item) => (
        <div key={item.id} role="listitem">
          <MediaCard media={item} />
        </div>
      ))}
    </div>
  );
}

export function MediaGridSkeleton({ count = 20 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <MediaCardSkeleton key={i} />
      ))}
    </div>
  );
}
