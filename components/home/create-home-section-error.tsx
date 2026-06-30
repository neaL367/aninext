"use client";

import { HomeSectionError } from "@/components/home/home-section-error";

export function createHomeSectionError(title: string) {
  return function HomeSectionErrorBoundary({
    reset,
  }: {
    error: Error;
    reset: () => void;
  }) {
    return <HomeSectionError title={`${title} unavailable`} reset={reset} />;
  };
}
