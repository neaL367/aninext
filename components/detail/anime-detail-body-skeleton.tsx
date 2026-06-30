import { Skeleton } from "@/components/ui/skeleton";
import { DETAIL_BODY_GRID_CLASS } from "@/lib/styles/detail-page-layout";

/** Grid-only fallback while detail body streams in. */
export function AnimeDetailBodySkeleton() {
  return (
    <>
      <Skeleton className="h-4 w-48 max-w-full" aria-hidden />
      <div className={DETAIL_BODY_GRID_CLASS}>
        <div className="flex flex-col gap-4">
          <Skeleton className="mx-auto aspect-[2/3] w-full max-w-[13rem] rounded-xl sm:max-w-[15rem] lg:mx-0 lg:max-w-none" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <div className="flex flex-col gap-3 border-b border-border pb-6">
            <Skeleton className="h-10 w-4/5 max-w-md" />
            <Skeleton className="h-4 w-3/5 max-w-xs" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-16" />
              ))}
            </div>
          </div>
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    </>
  );
}
