import type { MediaCard } from "@/lib/anilist/types";
import { AnimeCard } from "@/components/anime/anime-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ANIME_GRID_CLASS } from "@/lib/ui/anime-grid-layout";
import { cn } from "@/lib/utils";

type AnimeGridProps = {
  media: readonly (MediaCard & {
    popularityPercent?: number | null;
    rank?: number;
  })[];
  showCountdown?: boolean;
  className?: string;
};

export function AnimeGrid({
  media,
  showCountdown = false,
  className,
}: AnimeGridProps) {
  return (
    <div className={cn(ANIME_GRID_CLASS, className)}>
      {media.map((item) => (
        <AnimeCard
          key={item.id}
          media={item}
          showCountdown={showCountdown}
        />
      ))}
    </div>
  );
}

export function AnimeGridSkeleton({
  count = 12,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn(ANIME_GRID_CLASS, className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col overflow-hidden rounded-md border border-border/80 bg-card"
        >
          <Skeleton className="aspect-[2/3] max-h-[15rem] w-full rounded-none" />
          <div className="flex flex-col gap-1.5 border-t border-border p-2.5">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3.5 w-3/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
