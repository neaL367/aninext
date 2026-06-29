"use client";

import { HomeSectionError } from "@/components/home/home-section-error";

export default function AllTimePopularError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <HomeSectionError title="All Time Popular unavailable" reset={reset} />
  );
}
