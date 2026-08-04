import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { ErrorBoundary } from "@/components/error-boundary";
import { AiringCalendar, AiringCalendarSkeleton } from "@/features/anime/components/airing-calendar";
import { AiringTimeline, AiringTimelineSkeleton } from "@/features/anime/components/airing-timeline";

export const instant = false;

export const metadata: Metadata = {
  title: "Anime Airing Schedule — AniNext",
  description: "See what anime is airing this week. Plan your watching schedule.",
  alternates: { canonical: "/airing" },
};

export default async function AiringPage({
  searchParams,
}: {
  searchParams: Promise<{ day?: string }>;
}) {
  const sp = await searchParams;
  await connection();
  const today = new Date().toISOString().split("T")[0];
  const day = sp.day ?? today;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Airing Schedule</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          See what's airing this week and plan your watchlist
        </p>
      </div>
      <AiringCalendar currentDay={day} today={today} />
      <ErrorBoundary title="Schedule failed to load">
        <Suspense fallback={<AiringTimelineSkeleton />}>
          <AiringTimeline day={day} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
