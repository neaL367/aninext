import { io } from "next/cache";
import { redirect } from "next/navigation";

import { Crossfade } from "@/components/ui/crossfade";
import { getAiringWeek } from "@/features/anime/anime-queries";
import { localDateStr } from "@/features/anime/lib/media-helpers";

import { AiringDayDefault } from "./airing-day-default";
import { AiringDayStrip, AiringDayStripSkeleton } from "./airing-day-strip";
import { AiringNow, AiringNowSkeleton } from "./airing-now";
import { AiringTimeline, AiringTimelineSkeleton } from "./airing-timeline";

export async function AiringDayView(props: { day?: string; offsetMinutes?: number }) {
  // The "today" fallback below reads the current date, which must not be captured
  // into the static shell — keep this subtree out of prerendering so the redirect
  // and day computation happen per request. (Suspends during prerender; the page
  // skeleton ships as the shell and this streams in.)
  await io();

  // The server's own "today" — the day a bare /airing request would redirect to.
  // Passed separately so AiringDayDefault can tell "server picked the day" apart
  // from "visitor chose this day" (which must never be rewritten).
  const serverToday = localDateStr();
  const day = props.day ?? serverToday;
  if (!props.day) {
    redirect(`/airing?day=${day}`);
  }

  // One week-long fetch covers the rail AND the selected day — switching days
  // (within the week) re-renders from this cached slice instead of re-fetching.
  const week = await getAiringWeek(day, props.offsetMinutes);
  const schedules = week.schedules[day] ?? [];

  return (
    <div className="space-y-10">
      <AiringDayDefault serverToday={serverToday} />

      {/* Stable across day switches — only the highlight/`currentDay` changes,
          so the sticky rail never remounts or flickers. */}
      <AiringDayStrip
        currentDay={day}
        week={week.days}
        today={week.today}
        schedules={schedules}
        context={week.context}
      />

      {/* Keyed by day: only the day-dependent content remounts and crossfades. */}
      <Crossfade key={day}>
        <div className="space-y-10">
          <AiringNow schedules={schedules} offsetMinutes={week.context.offsetMinutes} />
          <AiringTimeline day={day} schedules={schedules} context={week.context} />
        </div>
      </Crossfade>
    </div>
  );
}

export function AiringDayViewSkeleton() {
  return (
    <div className="space-y-10">
      <AiringDayStripSkeleton />
      <AiringNowSkeleton />
      <AiringTimelineSkeleton />
    </div>
  );
}
