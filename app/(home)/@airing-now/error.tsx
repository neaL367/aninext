"use client";

import { HomeSectionError } from "@/components/home/home-section-error";

export default function AiringNowError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return <HomeSectionError title="Airing Now unavailable" reset={reset} />;
}
