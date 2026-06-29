import { Suspense } from "react";
import { AiringScheduleView } from "@/components/airing/airing-schedule-view";
import { AiringSkeleton } from "@/components/airing/airing-skeleton";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { getAiringSchedulesForRequest } from "@/lib/anilist/server/get-airing-schedules";
import { createPageMetadata } from "@/lib/seo/metadata";

export const instant = false;

export const metadata = createPageMetadata({
  title: "Airing Schedule",
  description: "See what anime is airing this week, grouped by weekday and format.",
  path: "/airing",
});

async function AiringPageContent() {
  const schedules = await getAiringSchedulesForRequest();
  return <AiringScheduleView schedules={schedules ?? []} />;
}

export default async function AiringPage() {
  void getAiringSchedulesForRequest();

  return (
    <PageContainer className="flex flex-col gap-4 py-6 lg:gap-5 lg:py-8">
      <PageHeader
        title="Airing Schedule"
        description="Anime grouped by weekday and format for the current week."
      />
      <Suspense fallback={<AiringSkeleton />}>
        <AiringPageContent />
      </Suspense>
    </PageContainer>
  );
}
