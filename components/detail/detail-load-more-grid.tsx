"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

type DetailLoadMoreGridProps = {
  /** Pre-rendered items (rendered by the caller so it can stay a Server Component). */
  items: readonly ReactNode[];
  initialCount?: number;
  step?: number;
  gridClassName: string;
  loadMoreLabel?: string;
};

export function DetailLoadMoreGrid({
  items,
  initialCount = 12,
  step = 12,
  gridClassName,
  loadMoreLabel = "Load more",
}: DetailLoadMoreGridProps) {
  const [visibleCount, setVisibleCount] = useState(initialCount);
  const visible = items.slice(0, visibleCount);
  const remaining = items.length - visibleCount;

  if (!items.length) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className={gridClassName}>{visible}</div>
      {remaining > 0 ? (
        <Button
          type="button"
          variant="outline"
          className="mx-auto w-full max-w-xs"
          onClick={() => setVisibleCount((count) => Math.min(count + step, items.length))}
        >
          {loadMoreLabel}
          <span className="text-muted-foreground">({remaining} left)</span>
        </Button>
      ) : null}
    </div>
  );
}
