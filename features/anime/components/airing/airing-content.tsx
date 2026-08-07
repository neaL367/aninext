import { io } from "next/cache";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { ErrorBoundary } from "@/components/ui/error-boundary";
import { localDateStr } from "@/features/anime/lib/media-helpers";

import { AiringCalendar, AiringCalendarSkeleton } from "./airing-calendar";
import { AiringTimeline, AiringTimelineSkeleton } from "./airing-timeline";

export async function AiringContent({ day }: { day?: string }) {
  await io();

  if (!day) {
    redirect(`/airing?day=${localDateStr()}`);
  }

  return (
    <>
      <Suspense fallback={<AiringCalendarSkeleton />}>
        <AiringCalendar currentDay={day} />
      </Suspense>

      <div className="mt-10">
        <ErrorBoundary title="Schedule failed to load">
          <Suspense fallback={<AiringTimelineSkeleton />}>
            <AiringTimeline day={day} />
          </Suspense>
        </ErrorBoundary>
      </div>
    </>
  );
}

export function AiringContentSkeleton() {
  return (
    <>
      <AiringCalendarSkeleton />
      <div className="mt-10">
        <AiringTimelineSkeleton />
      </div>
    </>
  );
}
