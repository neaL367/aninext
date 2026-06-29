"use client";

import { SectionError } from "@/components/shared/section-error";

type HomeSectionErrorProps = {
  title: string;
  reset: () => void;
};

export function HomeSectionError({ title, reset }: HomeSectionErrorProps) {
  return (
    <div className="flex flex-col gap-3">
      <SectionError title={title} />
      <button
        type="button"
        onClick={reset}
        className="text-sm font-medium text-foreground underline underline-offset-4"
      >
        Retry
      </button>
    </div>
  );
}
