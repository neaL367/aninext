import type { MediaCard } from "@/lib/anilist/types";
import { AnimeCard } from "@/components/anime/anime-card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const GRID_CLASS =
  "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";

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
    <div className={cn(GRID_CLASS, className)}>
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
  count = 10,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn(GRID_CLASS, className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm"
        >
          <Skeleton className="aspect-[3/4] w-full rounded-none" />
          <div className="flex flex-col gap-1.5 border-t border-border p-3">
            <Skeleton className="h-3.5 w-4/5" />
            <Skeleton className="h-3 w-3/5" />
            <Skeleton className="h-2.5 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
