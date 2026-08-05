import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { RadioIcon } from "lucide-react";
import { ErrorBoundary } from "@/components/error-boundary";
import { Crossfade } from "@/components/crossfade";
import { AiringCalendar, AiringCalendarSkeleton } from "@/features/anime/components/airing-calendar";
import { AiringTimeline, AiringTimelineSkeleton } from "@/features/anime/components/airing-timeline";
import { AiringDefaultDaySync } from "@/features/anime/components/airing-default-day-sync";

export const instant = false;

export const metadata: Metadata = {
  title: "Airing schedule — AniNext",
  description: "See what anime is airing this week and plan your next watch.",
  alternates: { canonical: "/airing" },
};

export default function AiringPage({ searchParams }: { searchParams: Promise<{ day?: string }> }) {
  return searchParams.then(async (sp) => {
    await connection();
    const day = sp.day ?? new Date().toISOString().split("T")[0];

    return (
      <Crossfade>
      <div className="mx-auto w-full max-w-[1680px] px-4 py-8 sm:px-7 sm:py-12 lg:px-10 lg:py-16">
        <header className="mb-8">
          <p className="eyebrow flex items-center gap-2 text-accent"><RadioIcon className="size-3" /> Airing this week</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">Schedule</h1>
        </header>

        <AiringDefaultDaySync day={day} />
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
      </div>
      </Crossfade>
    );
  });
}
