import { Suspense } from "react";
import { AiringSchedulePageContent } from "@/components/airing/airing-schedule-page-content";
import { AiringScheduleShell } from "@/components/airing/airing-schedule-shell";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { createPageMetadata } from "@/lib/seo/metadata";

export const instant = false;

export const metadata = createPageMetadata({
  title: "Airing Schedule",
  description: "See what anime is airing this week, grouped by weekday and format.",
  path: "/airing",
});

export default function AiringPage() {
  return (
    <PageContainer className="flex flex-col gap-4 py-6 lg:gap-5 lg:py-8">
      <PageHeader
        title="Airing Schedule"
        description="Anime grouped by weekday and format for the current week."
      />
      <Suspense fallback={<AiringScheduleShell />}>
        <AiringSchedulePageContent />
      </Suspense>
    </PageContainer>
  );
}
