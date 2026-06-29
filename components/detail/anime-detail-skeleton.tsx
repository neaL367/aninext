import { PageContainer } from "@/components/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export function AnimeDetailSkeleton() {
  return (
    <>
      <Skeleton className="h-20 w-full rounded-none sm:h-24" />
      <PageContainer className="flex flex-col gap-8 py-8 lg:gap-10 lg:py-12">
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-48" />
        </div>

        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-8">
          <Skeleton className="aspect-[2/3] w-full max-w-[10.5rem] rounded-lg sm:max-w-[11.5rem]" />
          <div className="flex w-full flex-1 flex-col items-center gap-5 sm:items-start">
            <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-16" />
              ))}
            </div>
            <Skeleton className="h-10 w-full max-w-lg" />
            <Skeleton className="h-4 w-full max-w-md" />
            <Skeleton className="h-4 w-56" />
            <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-8 w-40" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 rounded-lg border border-border p-4 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-32 w-full max-w-prose" />
        </div>

        <div className="flex flex-col gap-4 border-t border-border pt-8">
          <Skeleton className="h-6 w-28" />
          <div className="grid gap-2 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        </div>
      </PageContainer>
    </>
  );
}
