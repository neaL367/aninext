import { Suspense } from "react";
import { AiringScheduleInteractive } from "@/components/airing/airing-schedule-interactive";
import { AiringScheduleShell } from "@/components/airing/airing-schedule-shell";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { AniListRateLimitNotice } from "@/components/shared/anilist-rate-limit-notice";
import { isAniListRateLimitError } from "@/lib/anilist/domain/errors";
import { getAiringScheduleBootstrap } from "@/lib/anilist/server/get-airing-schedules";
import { createPageMetadata } from "@/lib/seo/metadata";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata = createPageMetadata({
  title: "Airing Schedule",
  description: "See what anime is airing this week, grouped by weekday and format.",
  path: "/airing",
});

async function AiringPageContent() {
  try {
    const { dateKeys, priorityDateKey, initialDayPromise } = await getAiringScheduleBootstrap();
    return (
      <AiringScheduleInteractive
        dateKeys={dateKeys}
        priorityDateKey={priorityDateKey}
        initialDayPromise={initialDayPromise}
      />
    );
  } catch (error) {
    if (isAniListRateLimitError(error)) {
      return <AniListRateLimitNotice title="Unable to load airing schedule" />;
    }
    throw error;
  }
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
