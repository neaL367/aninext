"use client";

import { RouteError } from "@/components/layout/route-error";

export default function EntityDetailRouteError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return <RouteError title="Unable to load details" reset={reset} />;
}
