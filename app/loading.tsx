import { PageContainer } from "@/components/layout/page-container";
import { SectionSkeleton } from "@/components/shared/section-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function RootLoading() {
  return (
    <PageContainer className="flex flex-col gap-10 py-8 lg:gap-12 lg:py-10">
      <header className="flex max-w-prose flex-col gap-2 pb-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-64 sm:h-9" />
        <Skeleton className="h-4 w-full max-w-md" />
        <Skeleton className="h-4 w-4/5 max-w-sm" />
      </header>
      <SectionSkeleton />
      <SectionSkeleton />
      <SectionSkeleton />
    </PageContainer>
  );
}
