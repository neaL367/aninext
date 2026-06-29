import { PageContainer } from "@/components/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export function AnimeDetailSkeleton() {
  return (
    <>
      <Skeleton className="h-52 w-full rounded-none sm:h-64 lg:h-80 xl:h-96" />
      <PageContainer className="relative -mt-6 flex flex-col gap-6 py-4 sm:-mt-8 lg:gap-8 lg:py-6">
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-48" />
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
          <div className="flex flex-col gap-4">
            <Skeleton className="mx-auto aspect-[2/3] w-full max-w-[13rem] rounded-xl sm:max-w-[15rem] lg:mx-0 lg:max-w-none" />
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>

          <div className="flex min-w-0 flex-col gap-8 lg:gap-10">
            <div className="flex flex-col gap-3 border-b border-border pb-6">
              <Skeleton className="h-10 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-16" />
                ))}
              </div>
            </div>

            <Skeleton className="h-40 w-full rounded-xl" />

            <div className="flex flex-col gap-4">
              <Skeleton className="h-6 w-28" />
              <div className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </>
  );
}
