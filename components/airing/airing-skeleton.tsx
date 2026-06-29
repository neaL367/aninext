import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type AiringSkeletonProps = {
  className?: string;
};

export function AiringSkeleton({ className }: AiringSkeletonProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-3 w-36" />
      </div>

      {Array.from({ length: 3 }).map((_, section) => (
        <div key={section} className="flex flex-col gap-3">
          <div className="flex items-end justify-between gap-3">
            <div className="flex flex-col gap-1">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[4.5rem] rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
