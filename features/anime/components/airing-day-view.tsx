import { redirect } from "next/navigation";
import { Suspense } from "react";

import { localDateStr } from "@/features/anime/lib/media-helpers";

import { AiringCalendar, AiringCalendarSkeleton } from "./airing-calendar";
import { AiringTVGuide, AiringTVGuideSkeleton } from "./airing-tv-guide";

async function AiringSchedule({ day }: { day: string }) {
  const { getAiringSchedule } = await import("./airing-timeline");
  const schedules = await getAiringSchedule(day);
  return <AiringTVGuide day={day} schedules={schedules} />;
}

export async function AiringDayView(props: { day?: string }) {
  const day = props.day ?? localDateStr();
  if (!props.day) {
    redirect(`/airing?day=${day}`);
  }

  return (
    <div className="space-y-8">
      <Suspense fallback={<AiringCalendarSkeleton />}>
        <AiringCalendar currentDay={day} />
      </Suspense>

      <Suspense fallback={<AiringTVGuideSkeleton />}>
        <AiringSchedule day={day} />
      </Suspense>
    </div>
  );
}

export function AiringDayViewSkeleton() {
  return (
    <div className="space-y-8">
      <AiringCalendarSkeleton />
      <AiringTVGuideSkeleton />
    </div>
  );
}
