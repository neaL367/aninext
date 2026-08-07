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
    <div className="mx-auto w-full max-w-[1680px] px-4 py-8 sm:px-7 sm:py-12 lg:px-10 space-y-8">
      <header className="space-y-3">
        <p className="eyebrow">Timeline / Weekly Airing Radar</p>
        <h1 className="text-4xl font-semibold tracking-[-0.055em] text-foreground sm:text-6xl">
          Airing Schedule
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Track upcoming episodes releasing today and throughout the week in real-time.
        </p>
      </header>

      <AiringDayDefault urlDay={day} serverDay={serverDay} />
      <Suspense fallback={<AiringCalendarSkeleton />}>
        <AiringCalendar currentDay={day} />
      </Suspense>

      <div className="pt-4">
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
    <div className="mx-auto w-full max-w-[1680px] px-4 py-8 sm:px-7 sm:py-12 lg:px-10 space-y-8">
      <div className="space-y-3">
        <div className="shimmer h-3 w-32 rounded" />
        <div className="shimmer h-12 w-64 rounded" />
        <div className="shimmer h-4 w-96 rounded" />
      </div>
      <AiringCalendarSkeleton />
      <div className="pt-4">
        <AiringTimelineSkeleton />
      </div>
    </div>
  );
}
