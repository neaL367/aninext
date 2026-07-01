"use client";

import { RouteError } from "@/components/layout/route-error";

export default function AnimeError({ reset }: { error: Error; reset: () => void }) {
  return (
    <RouteError
      title="Unable to load anime list"
      message="The anime listing failed to load. Please try again."
      reset={reset}
    />
  );
}
