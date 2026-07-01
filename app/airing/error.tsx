"use client";

import { RouteError } from "@/components/layout/route-error";

export default function AiringError({ reset }: { error: Error; reset: () => void }) {
  return <RouteError title="Unable to load airing schedule" reset={reset} />;
}
