import { Suspense } from "react";
import { AiringScheduleInteractive } from "@/components/airing/airing-schedule-interactive";
import { AiringScheduleShell } from "@/components/airing/airing-schedule-shell";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { getAiringDayPromisesForRequest } from "@/lib/anilist/server/get-airing-schedules";
import { createPageMetadata } from "@/lib/seo/metadata";

export const instant = false;

export const metadata = createPageMetadata({
  title: "Airing Schedule",
  description: "See what anime is airing this week, grouped by weekday and format.",
  path: "/airing",
});

async function AiringPageContent() {
  const { dateKeys, dayPromises } = await getAiringDayPromisesForRequest();

  return <AiringScheduleInteractive dateKeys={dateKeys} dayPromises={dayPromises} />;
}

export default function AiringPage() {
  return (
    <PageContainer className="flex flex-col gap-4 py-6 lg:gap-5 lg:py-8">
      <PageHeader
        title="Airing Schedule"
        description="Anime grouped by weekday and format for the current week."
      />
      <Suspense fallback={<AiringScheduleShell />}>
        <AiringPageContent />
      </Suspense>
    </PageContainer>
  );
}
