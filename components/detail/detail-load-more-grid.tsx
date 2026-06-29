"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

type DetailLoadMoreGridProps<T> = {
  items: readonly T[];
  initialCount?: number;
  step?: number;
  renderItem: (item: T, index: number) => ReactNode;
  gridClassName: string;
  loadMoreLabel?: string;
};

export function DetailLoadMoreGrid<T>({
  items,
  initialCount = 12,
  step = 12,
  renderItem,
  gridClassName,
  loadMoreLabel = "Load more",
}: DetailLoadMoreGridProps<T>) {
  const [visibleCount, setVisibleCount] = useState(initialCount);
  const visible = items.slice(0, visibleCount);
  const remaining = items.length - visibleCount;

  if (!items.length) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className={gridClassName}>
        {visible.map((item, index) => renderItem(item, index))}
      </div>
      {remaining > 0 ? (
        <Button
          type="button"
          variant="outline"
          className="mx-auto w-full max-w-xs"
          onClick={() =>
            setVisibleCount((count) => Math.min(count + step, items.length))
          }
        >
          {loadMoreLabel}
          <span className="text-muted-foreground">({remaining} left)</span>
        </Button>
      ) : null}
    </div>
  );
}
