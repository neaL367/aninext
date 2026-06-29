"use client";

import { XIcon } from "lucide-react";
import type { AnimeListParams } from "@/lib/routes/search-params";
import {
  getActiveFilterChips,
  removeFilterChip,
} from "@/lib/routes/search-params";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type FilterChipsProps = {
  params: AnimeListParams;
  onChange: (params: AnimeListParams) => void;
  onClearAll: () => void;
};

export function FilterChips({ params, onChange, onClearAll }: FilterChipsProps) {
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
            onClick={() => onChange(removeFilterChip(params, chip.key))}
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
        onClick={onClearAll}
      >
        Clear all
      </Button>
    </div>
  );
}
