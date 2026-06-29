import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type AiringSkeletonProps = {
  className?: string;
};

export function AiringSkeleton({ className }: AiringSkeletonProps) {
  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-5 w-24" />
      </div>

      <div className="grid grid-cols-7 gap-1 rounded-lg border border-border p-1">
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton key={index} className="h-14 rounded-md" />
        ))}
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-border p-5">
        <div className="flex items-end justify-between gap-3 border-b border-border pb-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-[4.5rem] rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}
