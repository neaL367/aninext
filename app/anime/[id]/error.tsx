"use client";

import { RouteError } from "@/components/layout/route-error";

export default function AnimeDetailError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <RouteError title="Unable to load anime details" reset={reset} />
  );
}
