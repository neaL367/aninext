import { Suspense } from "react";

import { ErrorBoundary } from "@/components/ui/error-boundary";
import { AiringDayView, AiringDayViewSkeleton } from "@/features/anime/components/airing-day-view";
import { parseAiringParams } from "@/features/anime/lib/airing";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Airing schedule — AniNext",
  description: "See what anime is airing this week and plan your next watch.",
  alternates: { canonical: "/airing" },
};

export default function AiringPage({ searchParams }: PageProps<"/airing">) {
  return (
    <ErrorBoundary title="Airing schedule failed to load">
      <Suspense fallback={<AiringDayViewSkeleton />}>
        {searchParams.then((sp) => {
          const { day, offsetMinutes } = parseAiringParams(sp);
          return <AiringDayView day={day} offsetMinutes={offsetMinutes} />;
        })}
      </Suspense>
    </ErrorBoundary>
  );
}
