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
    <>
      <AiringDayDefault urlDay={day} serverDay={serverDay} />
      <Suspense fallback={<AiringCalendarSkeleton />}>
        <AiringCalendar currentDay={day} />
      </Suspense>

      <div className="mt-10">
        <ErrorBoundary title="Schedule failed to load">
          <AiringTimeline day={day} />
        </ErrorBoundary>
      </div>
    </>
  );
}

export function AiringDayViewSkeleton() {
  return (
    <>
      <AiringCalendarSkeleton />
      <div className="mt-10">
        <AiringTimelineSkeleton />
      </div>
    </>
  );
}
