import { Suspense } from "react";

import { AiringDayView, AiringDayViewSkeleton } from "@/features/anime/components/airing-day-view";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Airing schedule — AniNext",
  description: "See what anime is airing this week and plan your next watch.",
  alternates: { canonical: "/airing" },
};

export default function AiringPage({ searchParams }: PageProps<"/airing">) {
  return (
    <Suspense fallback={<AiringDayViewSkeleton />}>
      {searchParams.then((sp) => (
        <AiringDayView day={typeof sp.day === "string" ? sp.day : undefined} />
      ))}
    </Suspense>
  );
}
