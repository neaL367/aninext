"use client";

import { XIcon } from "lucide-react";
import { useBrowseFilters } from "@/components/browse/browse-filters-provider";
import {
  getActiveFilterChips,
  removeFilterChip,
} from "@/lib/routes/search-params";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function FilterChips() {
  const { state, actions } = useBrowseFilters();
  const { params } = state;
  const { applyFilters, resetFilters } = actions;
  const chips = getActiveFilterChips(params);

  if (!chips.length) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {chips.map((chip) => (
        <Badge
          key={chip.key}
          variant="secondary"
          className="h-7 gap-1 pr-1 font-normal"
        >
          {chip.label}
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="size-5"
            aria-label={`Remove ${chip.label}`}
            onClick={() => applyFilters(removeFilterChip(params, chip.key))}
          >
            <XIcon className="size-3" />
          </Button>
        </Badge>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="xs"
        className="h-7 text-muted-foreground"
        onClick={resetFilters}
      >
        Clear all
      </Button>
    </div>
  );
}
