import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { ErrorBoundary } from "@/components/ui/error-boundary";
import { AiringDayView, AiringDayViewSkeleton } from "@/features/anime/components/airing-day-view";
import { parseAiringOffset, parseDayParam } from "@/features/anime/lib/airing";
import { localDateStr } from "@/features/anime/lib/media-helpers";

import type { Metadata, Route } from "next";

export async function generateMetadata({
  params,
}: Pick<PageProps<"/airing/[day]">, "params">): Promise<Metadata> {
  const { day } = await params;
  const validDay = parseDayParam(day);
  if (!validDay) return {};
  return {
    title: `Airing schedule for ${validDay}`,
    description: `Anime airing on ${validDay}.`,
    alternates: { canonical: `/airing/${validDay}` },
  };
}

export default function AiringDayPage({
  params,
  searchParams,
}: Pick<PageProps<"/airing/[day]">, "params" | "searchParams">) {
  return (
    <ErrorBoundary title="Airing schedule failed to load">
      <Suspense fallback={<AiringDayViewSkeleton />}>
        {Promise.all([params, searchParams, cookies()]).then(
          ([{ day: rawDay }, sp, cookieStore]) => {
            // Invalid days normalize to today. Legacy `?offset=` links
            // normalize to the clean canonical day URL — timezone now
            // resolves from the `tz_offset` cookie, never the URL.
            const day = parseDayParam(rawDay);
            if (!day) redirect(`/airing/${localDateStr()}` as Route);
            if (typeof sp.offset === "string") redirect(`/airing/${day}` as Route);
            const cookieOffset = cookieStore.get("tz_offset")?.value;
            const resolvedOffset = cookieOffset ? parseAiringOffset(cookieOffset) : undefined;
            return <AiringDayView day={day} offsetMinutes={resolvedOffset} />;
          },
        )}
      </Suspense>
    </ErrorBoundary>
  );
}
