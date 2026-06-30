import type { AnimeCardMedia } from "@/components/anime/anime-card-parts";
import { AnimeTooltipCard } from "@/components/anime/anime-tooltip-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ANIME_BROWSE_GRID_CELL_CLASS,
  ANIME_BROWSE_GRID_CLASS,
  ANIME_GRID_CELL_CLASS,
  ANIME_GRID_CLASS,
} from "@/lib/styles/anime-grid-layout";
import { cn } from "@/lib/utils";

type AnimeMediaGridLayout = "carousel" | "browse";

type AnimeMediaGridProps = {
  media: readonly AnimeCardMedia[];
  layout?: AnimeMediaGridLayout;
  showCountdown?: boolean;
  className?: string;
};

function getGridClasses(layout: AnimeMediaGridLayout) {
  return layout === "browse"
    ? { grid: ANIME_BROWSE_GRID_CLASS, cell: ANIME_BROWSE_GRID_CELL_CLASS }
    : { grid: ANIME_GRID_CLASS, cell: ANIME_GRID_CELL_CLASS };
}

export function AnimeMediaGrid({
  media,
  layout = "carousel",
  showCountdown = false,
  className,
}: AnimeMediaGridProps) {
  const { grid, cell } = getGridClasses(layout);

  return (
    <div className={cn(grid, className)}>
      {media.map((item, index) => (
        <div key={item.id} className={cell}>
          <AnimeTooltipCard
            media={item}
            layout={layout}
            showCountdown={showCountdown}
            priority={index === 0}
          />
        </div>
      ))}
    </div>
  );
}

export function AnimeMediaGridSkeleton({
  layout = "carousel",
  count = 12,
  className,
}: {
  layout?: AnimeMediaGridLayout;
  count?: number;
  className?: string;
}) {
  const { grid, cell } = getGridClasses(layout);
  const coverClass =
    layout === "browse"
      ? "aspect-[2/3] max-h-48 w-full rounded-none sm:max-h-52 md:max-h-56 lg:max-h-60"
      : "aspect-[2/3] max-h-44 w-full rounded-none sm:max-h-48 md:max-h-52 lg:max-h-54";

  return (
    <div className={cn(grid, className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={cell}>
          <div className="flex h-full flex-col overflow-hidden rounded-md border border-border/80 bg-card">
            <Skeleton className={coverClass} />
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
