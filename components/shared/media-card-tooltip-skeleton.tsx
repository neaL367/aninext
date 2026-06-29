import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type MediaCardTooltipBodySkeletonProps = {
  className?: string;
  lines?: number;
  showTags?: boolean;
};

export function MediaCardTooltipBodySkeleton({
  className,
  lines = 4,
  showTags = true,
}: MediaCardTooltipBodySkeletonProps) {
  return (
    <div className={cn("flex flex-col gap-3 p-4", className)}>
      <div className="flex flex-col gap-2">
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            className={cn("h-3.5", index === lines - 1 ? "w-4/5" : "w-full")}
          />
        ))}
      </div>
      <Skeleton className="h-8 w-full" />
      {showTags ? (
        <div className="flex flex-wrap gap-1.5">
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-12" />
        </div>
      ) : null}
    </div>
  );
}
