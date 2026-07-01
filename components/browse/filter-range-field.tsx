"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

type FilterRangeFieldProps = {
  label: string;
  min: number;
  max: number;
  step?: number;
  valueMin: number | null;
  valueMax: number | null;
  onChange: (min: number | null, max: number | null) => void;
  formatValue?: (value: number) => string;
  className?: string;
};

function formatRangeLabel(
  low: number,
  high: number,
  min: number,
  max: number,
  formatValue?: (value: number) => string,
): string {
  const fmt = formatValue ?? String;
  const atMin = low <= min;
  const atMax = high >= max;
  if (atMin && atMax) return "Any";
  if (low === high) return fmt(low);
  if (atMin) return `Up to ${fmt(high)}`;
  if (atMax) return `${fmt(low)}+`;
  return `${fmt(low)} – ${fmt(high)}`;
}

function toCommittedRange(
  values: readonly number[],
  min: number,
  max: number,
): [number | null, number | null] {
  const nextLow = values[0] ?? min;
  const nextHigh = values[1] ?? max;
  return [nextLow <= min ? null : nextLow, nextHigh >= max ? null : nextHigh];
}

export function FilterRangeField({
  label,
  min,
  max,
  step = 1,
  valueMin,
  valueMax,
  onChange,
  formatValue,
  className,
}: FilterRangeFieldProps) {
  const committedLow = valueMin ?? min;
  const committedHigh = valueMax ?? max;
  const [draft, setDraft] = useState<[number, number] | null>(null);
  const [low, high] = draft ?? [committedLow, committedHigh];

  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-medium text-muted-foreground">{label}</span>
        <span className="shrink-0 tabular-nums text-foreground">
          {formatRangeLabel(low, high, min, max, formatValue)}
        </span>
      </div>
      <Slider
        className="px-1"
        min={min}
        max={max}
        step={step}
        minStepsBetweenValues={0}
        value={[low, high]}
        onValueChange={(values) => {
          const next = values as number[];
          setDraft([next[0] ?? min, next[1] ?? max]);
        }}
        onValueCommitted={(values) => {
          const [nextMin, nextMax] = toCommittedRange(values as number[], min, max);
          setDraft(null);
          onChange(nextMin, nextMax);
        }}
      />
    </div>
  );
}

type FilterMinFieldProps = {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number | null;
  onChange: (value: number | null) => void;
  formatValue?: (value: number) => string;
  anyLabel?: string;
  /** Slider position when the filter is unset (avoids a stuck thumb at min). */
  emptyValue?: number;
  className?: string;
};

export function FilterMinField({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  formatValue,
  anyLabel = "Any",
  emptyValue,
  className,
}: FilterMinFieldProps) {
  const empty = emptyValue ?? min;
  const committed = value ?? empty;
  const [draft, setDraft] = useState<number | null>(null);
  const current = draft ?? committed;
  const fmt = formatValue ?? String;
  const isActive = value != null;

  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-medium text-muted-foreground">{label}</span>
        <span className="shrink-0 tabular-nums text-foreground">
          {isActive ? fmt(current) : anyLabel}
        </span>
      </div>
      <Slider
        className="px-1"
        min={min}
        max={max}
        step={step}
        value={[current]}
        onValueChange={(values) => {
          setDraft((values as number[])[0] ?? empty);
        }}
        onValueCommitted={(values) => {
          const next = (values as number[])[0] ?? empty;
          setDraft(null);
          onChange(next <= empty ? null : next);
        }}
      />
    </div>
  );
}
