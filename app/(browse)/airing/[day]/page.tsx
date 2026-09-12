import { redirect } from "next/navigation";
import { Suspense } from "react";

import { ErrorBoundary } from "@/components/ui/error-boundary";
import { AiringDayView, AiringDayViewSkeleton } from "@/features/anime/components/airing-day-view";
import { parseAiringParams, parseDayParam } from "@/features/anime/lib/airing";
import { localDateStr } from "@/features/anime/lib/media-helpers";

import type { Metadata, Route } from "next";

export async function generateMetadata({
  params,
}: Pick<PageProps<"/airing/[day]">, "params">): Promise<Metadata> {
  const { day } = await params;
  const validDay = parseDayParam(day);
  if (!validDay) return {};
  return {
    title: `Airing schedule for ${validDay} — AniNext`,
    description: `Anime airing on ${validDay}. See times, episodes, and where to watch.`,
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
        {Promise.all([params, searchParams]).then(([{ day: rawDay }, sp]) => {
          // Invalid days normalize to today. This redirect streams (the shell
          // ships first, the router follows) — the HTTP-307 variant lives on
          // bare /airing, which blocks instead (see its `instant = false`).
          const day = parseDayParam(rawDay);
          if (!day) redirect(`/airing/${localDateStr()}` as Route);
          const { offsetMinutes } = parseAiringParams(sp);
          return <AiringDayView day={day} offsetMinutes={offsetMinutes} />;
        })}
      </Suspense>
    </ErrorBoundary>
  );
}
