"use client";

import { HomeSectionError } from "@/components/home/home-section-error";

export default function UpcomingNextSeasonError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <HomeSectionError title="Upcoming Next Season unavailable" reset={reset} />
  );
}
