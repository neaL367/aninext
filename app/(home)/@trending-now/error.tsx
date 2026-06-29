"use client";

import { HomeSectionError } from "@/components/home/home-section-error";

export default function TrendingNowError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return <HomeSectionError title="Trending Now unavailable" reset={reset} />;
}
