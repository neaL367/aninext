"use client";

import { Button } from "@/components/ui/button";
import { FilterChip } from "./filter-button";
import { useFilters } from "../../hooks/use-filters";
import { FILTER_TYPE_LABELS, FILTER_ORDER } from "../../lib/filter-constants";

export function ActiveFilters() {
  const { isPending, removeFilter, clearAll, activeFilters, groupedFilters } = useFilters();

  if (activeFilters.length === 0) return null;

  return (
    <div
      className="flex flex-col gap-3 border-b border-border-soft py-4"
      data-pending={isPending ? "" : undefined}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-foreground">
            Filters
          </span>
          <span className="flex size-5 items-center justify-center rounded-full bg-accent font-mono text-[0.6rem] font-semibold text-accent-foreground">
            {activeFilters.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          className="h-6 rounded-none px-2 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground"
        >
          Clear all
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        {FILTER_ORDER.map((key) => {
          const items = groupedFilters[key];
          if (!items) return null;
          const typeLabel = FILTER_TYPE_LABELS[key];

          return (
            <div key={key} className="flex items-center gap-1.5">
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted-foreground">
                {typeLabel}:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {items.map((item, i) => (
                  <FilterChip
                    key={`${item.key}-${item.value ?? i}`}
                    label={item.label}
                    onRemove={() => removeFilter(item.key, item.value)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
