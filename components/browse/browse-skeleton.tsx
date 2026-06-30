import { AnimeMediaGridSkeleton } from "@/components/anime/anime-media-grid";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type BrowseSkeletonProps = {
  className?: string;
};

/** Skeleton for browse filters and grid — page chrome should render outside Suspense. */
export function BrowseContentSkeleton({ className }: BrowseSkeletonProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <Skeleton className="h-9 min-w-0 flex-1" />
          <Skeleton className="h-9 w-24 shrink-0" />
        </div>
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-24 shrink-0" />
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-24" />
          ))}
        </div>
      </div>

      <AnimeMediaGridSkeleton layout="browse" count={12} />
    </div>
  );
}
