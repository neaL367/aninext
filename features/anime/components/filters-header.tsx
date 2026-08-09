"use client";

import { Button } from "@/components/ui/button";

export function FiltersHeader({
  facetCount,
  onClear,
  mobile = false,
}: {
  facetCount: number;
  onClear: () => void;
  mobile?: boolean;
}) {
  "use memo";
  if (mobile) {
    return facetCount > 0 ? (
      <div className="mb-3 flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-8 rounded-none px-2 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-muted-foreground"
        >
          Reset filters
        </Button>
      </div>
    ) : null;
  }

  return (
    <div className="mb-3 flex items-center justify-between border-b border-border-soft pb-3">
      <div className="flex items-center gap-2">
        <span className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-foreground">
          Filters
        </span>
        {facetCount > 0 && (
          <span className="flex size-5 items-center justify-center rounded-full bg-accent font-mono text-[0.6rem] font-semibold text-accent-foreground">
            {facetCount}
          </span>
        )}
      </div>
      {facetCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-8 rounded-none px-2 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground"
        >
          Reset
        </Button>
      )}
    </div>
  );
}
