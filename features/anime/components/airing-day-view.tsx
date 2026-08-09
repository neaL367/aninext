import { io } from "next/cache";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { ErrorBoundary } from "@/components/ui/error-boundary";
import { localDateStr } from "@/features/anime/lib/media-helpers";

import { AiringCalendar, AiringCalendarSkeleton } from "./airing-calendar";
import { AiringDayDefault } from "./airing-day-default";
import { AiringTimeline, AiringTimelineSkeleton } from "./airing-timeline";

export async function AiringDayView({ day }: { day?: string }) {
  await io();
  if (!day) {
    redirect(`/airing?day=${localDateStr()}`);
  }

  const serverDay = localDateStr();

  return (
    <div className="space-y-8">
      <AiringDayDefault urlDay={day} serverDay={serverDay} />
      <Suspense fallback={<AiringCalendarSkeleton />}>
        <AiringCalendar currentDay={day} />
      </Suspense>

      <div className="pt-2">
        <ErrorBoundary title="Schedule failed to load">
          <Suspense fallback={<AiringTimelineSkeleton />}>
            <AiringTimeline day={day} />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}

export function AiringDayViewSkeleton() {
  return (
    <div className="space-y-8">
      <AiringCalendarSkeleton />
      <div className="pt-2">
        <AiringTimelineSkeleton />
      </div>
    </div>
  );
}
