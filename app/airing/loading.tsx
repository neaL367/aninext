import { AiringScheduleShell } from "@/components/airing/airing-schedule-shell";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";

export default function AiringLoading() {
  return (
    <PageContainer className="flex flex-col gap-4 py-6 lg:gap-5 lg:py-8">
      <PageHeader
        title="Airing Schedule"
        description="Anime grouped by weekday and format for the current week."
      />
      <AiringScheduleShell />
    </PageContainer>
  );
}
