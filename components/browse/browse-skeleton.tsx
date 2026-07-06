import { AnimeMediaGridSkeleton } from "@/components/anime/anime-media-grid";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type BrowseSkeletonProps = {
  className?: string;
};

/** Skeleton for browse grid — page chrome should render outside Suspense. */
export function BrowseContentSkeleton({ className }: BrowseSkeletonProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <AnimeMediaGridSkeleton layout="browse" count={12} />
    </div>
  );
}
