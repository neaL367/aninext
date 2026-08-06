import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { AiringCalendar, AiringCalendarSkeleton } from "./airing-calendar";
import { AiringTimeline, AiringTimelineSkeleton } from "./airing-timeline";
import { ErrorBoundary } from "@/components/error-boundary";
import { localDateStr } from "@/features/anime/lib/media-helpers";

export async function AiringContent({
  searchParams,
}: {
  searchParams: Promise<{ day?: string }>;
}) {
  const sp = await searchParams;
  await connection();

  if (!sp.day) {
    redirect(`/airing?day=${localDateStr()}`);
  }

  const day = sp.day;

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
      <div className="mt-10"><AiringTimelineSkeleton /></div>
    </>
  );
}
