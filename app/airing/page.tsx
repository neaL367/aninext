import { connection } from "next/server";
import { Suspense } from "react";
import { AiringScheduleView } from "@/components/airing/airing-schedule-view";
import { AiringSkeleton } from "@/components/airing/airing-skeleton";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { getAiringSchedules } from "@/lib/anilist/server/get-airing-schedules";
import { getWeekRange } from "@/lib/anilist/utils/season";
import { createPageMetadata } from "@/lib/seo/metadata";

export const instant = false;

export const metadata = createPageMetadata({
  title: "Airing Schedule",
  description: "See what anime is airing this week, grouped by weekday and format.",
  path: "/airing",
});

async function AiringPageContent() {
  await connection();
  const week = getWeekRange();
  const schedules = (await getAiringSchedules(week.start, week.end)) ?? [];

  return <AiringScheduleView schedules={schedules} />;
}

export default function AiringPage() {
  return (
    <PageContainer className="flex flex-col gap-6 py-8 lg:gap-8 lg:py-10">
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
