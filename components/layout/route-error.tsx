"use client";

import { RetryError } from "@/components/shared/retry-error";

type RouteErrorProps = {
  title: string;
  message?: string;
  reset: () => void;
};

export function RouteError(props: RouteErrorProps) {
  return <RetryError {...props} variant="page" />;
}
