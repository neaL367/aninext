"use client";

import type { MediaFormat, MediaStatus } from "@/lib/anilist/types";
import { formatMediaFormat, formatMediaStatus } from "@/lib/anilist/utils/labels";
import { Button } from "@/components/ui/button";
import {
  toggleFormat,
  toggleStatus,
} from "@/lib/routes/filter-helpers";
import type { AnimeListParams } from "@/lib/routes/search-params";
import { cn } from "@/lib/utils";

const QUICK_FORMATS = ["TV", "MOVIE", "OVA"] as const satisfies readonly MediaFormat[];
const QUICK_STATUSES = [
  "RELEASING",
  "FINISHED",
  "NOT_YET_RELEASED",
] as const satisfies readonly MediaStatus[];

type AnimeQuickFiltersProps = {
  params: AnimeListParams;
  onChange: (params: AnimeListParams) => void;
  className?: string;
};

function QuickChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      size="xs"
      variant={active ? "secondary" : "outline"}
      className={cn("h-7 shrink-0 px-2.5 font-normal", active && "border-transparent")}
      onClick={onClick}
      aria-pressed={active}
    >
      {label}
    </Button>
  );
}

export function AnimeQuickFilters({
  params,
  onChange,
  className,
}: AnimeQuickFiltersProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {QUICK_FORMATS.map((format) => (
        <QuickChip
          key={format}
          active={params.formats.includes(format)}
          label={formatMediaFormat(format)}
          onClick={() => onChange(toggleFormat(params, format))}
        />
      ))}
      <span aria-hidden className="mx-0.5 h-4 w-px bg-border" />
      {QUICK_STATUSES.map((status) => (
        <QuickChip
          key={status}
          active={params.statuses.includes(status)}
          label={formatMediaStatus(status)}
          onClick={() => onChange(toggleStatus(params, status))}
        />
      ))}
    </div>
  );
}
