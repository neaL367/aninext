"use client";

import { HomeSectionError } from "@/components/home/home-section-error";

export default function Top100Error({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return <HomeSectionError title="Top 100 unavailable" reset={reset} />;
}
