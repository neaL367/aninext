"use client";

import { useFilterActions } from "../hooks/use-filter-actions";
import { useFilterState } from "../hooks/use-filter-state";
import { FilterChip } from "./filter-button";

export function ActiveFilters() {
  "use memo";
  const { activeFilters } = useFilterState();
  const { removeFilter, clearAll, isPending } = useFilterActions();

  if (activeFilters.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Active filters"
      aria-live="polite"
      data-pending={isPending ? "" : undefined}
      className="flex flex-wrap items-center gap-2 border-b border-border-soft pb-4 transition-opacity data-[pending]:opacity-50"
    >
      <span className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-muted-foreground/70">
        Active
      </span>
      {activeFilters.map((item, index) => (
        <FilterChip
          key={`${item.key}-${item.value ?? index}`}
          label={item.label}
          onRemove={() => removeFilter(item.key, item.value)}
        />
      ))}
      <button
        type="button"
        onClick={clearAll}
        className="ml-1 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
      >
        Clear
      </button>
    </div>
  );
}

export function ActiveFiltersSkeleton() {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border-soft pb-4">
      <div className="shimmer h-3 w-10 rounded-[2px]" />
      <div className="shimmer h-6 w-20 rounded-[2px]" />
      <div className="shimmer h-6 w-24 rounded-[2px]" />
      <div className="shimmer h-6 w-16 rounded-[2px]" />
    </div>
  );
}
