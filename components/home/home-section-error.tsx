"use client";

import { RetryError } from "@/components/shared/retry-error";

type HomeSectionErrorProps = {
  title: string;
  reset: () => void;
};

export function HomeSectionError({ title, reset }: HomeSectionErrorProps) {
  return <RetryError title={title} reset={reset} variant="section" />;
}
