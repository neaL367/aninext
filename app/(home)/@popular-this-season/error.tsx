"use client";

import { HomeSectionError } from "@/components/home/home-section-error";

export default function PopularThisSeasonError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <HomeSectionError title="Popular This Season unavailable" reset={reset} />
  );
}
