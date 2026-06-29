"use client";

import { SectionError } from "@/components/shared/section-error";

export default function Top100Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col gap-3">
      <SectionError title="Top 100 unavailable" />
      <button type="button" onClick={reset} className="text-sm font-medium underline underline-offset-4">
        Retry
      </button>
    </div>
  );
}
