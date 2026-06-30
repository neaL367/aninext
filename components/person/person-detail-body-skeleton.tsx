import { Skeleton } from "@/components/ui/skeleton";
import { PERSON_DETAIL_GRID_CLASS } from "@/lib/styles/person-page-layout";

export function PersonDetailBodySkeleton() {
  return (
    <>
      <Skeleton className="h-4 w-56 max-w-full" aria-hidden />
      <div className={PERSON_DETAIL_GRID_CLASS}>
        <Skeleton className="mx-auto aspect-[2/3] w-full max-w-[13rem] rounded-xl sm:max-w-[15rem] lg:mx-0 lg:max-w-none" />
        <div className="flex min-w-0 flex-col gap-6">
          <div className="flex flex-col gap-3 border-b border-border pb-6">
            <Skeleton className="h-10 w-4/5 max-w-md" />
            <Skeleton className="h-4 w-3/5 max-w-xs" />
          </div>
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    </>
  );
}
