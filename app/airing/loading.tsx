import { AiringSkeleton } from "@/components/airing/airing-skeleton";
import { PageContainer } from "@/components/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export default function AiringLoading() {
  return (
    <PageContainer className="flex flex-col gap-6 py-8 lg:gap-8 lg:py-10">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>
      <AiringSkeleton />
    </PageContainer>
  );
}
