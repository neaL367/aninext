import type { MediaCard } from "@/lib/anilist/types";
import { AnimeCard } from "@/components/anime/anime-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ANIME_BROWSE_GRID_CELL_CLASS,
  ANIME_BROWSE_GRID_CLASS,
  ANIME_GRID_CELL_CLASS,
  ANIME_GRID_CLASS,
} from "@/lib/ui/anime-grid-layout";
import { cn } from "@/lib/utils";

type AnimeGridVariant = "carousel" | "browse";

type AnimeGridProps = {
  media: readonly (MediaCard & {
    popularityPercent?: number | null;
    rank?: number;
  })[];
  showCountdown?: boolean;
  variant?: AnimeGridVariant;
  className?: string;
};

export function AnimeGrid({
  media,
  showCountdown = false,
  variant = "carousel",
  className,
}: AnimeGridProps) {
  const isBrowse = variant === "browse";

  return (
    <div
      className={cn(isBrowse ? ANIME_BROWSE_GRID_CLASS : ANIME_GRID_CLASS, className)}
    >
      {media.map((item, index) => (
        <div
          key={item.id}
          className={isBrowse ? ANIME_BROWSE_GRID_CELL_CLASS : ANIME_GRID_CELL_CLASS}
        >
          <AnimeCard
            media={item}
            showCountdown={showCountdown}
            variant={variant}
            priority={index === 0}
          />
        </div>
      ))}
    </div>
  );
}

export function AnimeGridSkeleton({
  count = 12,
  variant = "carousel",
  className,
}: {
  count?: number;
  variant?: AnimeGridVariant;
  className?: string;
}) {
  const isBrowse = variant === "browse";

  return (
    <div
      className={cn(isBrowse ? ANIME_BROWSE_GRID_CLASS : ANIME_GRID_CLASS, className)}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={isBrowse ? ANIME_BROWSE_GRID_CELL_CLASS : ANIME_GRID_CELL_CLASS}
        >
          <div className="flex h-full flex-col overflow-hidden rounded-md border border-border/80 bg-card">
            <Skeleton
              className={cn(
                "aspect-[2/3] w-full rounded-none",
                isBrowse
                  ? "max-h-48 sm:max-h-52 md:max-h-56 lg:max-h-60"
                  : "max-h-44 sm:max-h-48 md:max-h-52 lg:max-h-54"
              )}
            />
            <div className="flex flex-col gap-1.5 border-t border-border p-2.5">
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-3.5 w-3/5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}