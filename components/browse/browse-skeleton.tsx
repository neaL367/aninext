import { AnimeGridSkeleton } from "@/components/anime/anime-grid";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type BrowseSkeletonProps = {
  className?: string;
};

export function BrowseSkeleton({ className }: BrowseSkeletonProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>

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

      <AnimeGridSkeleton count={12} variant="browse" />
    </div>
  );
}
