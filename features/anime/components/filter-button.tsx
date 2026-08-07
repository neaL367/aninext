"use client";

import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type FilterOption = { value: string; label: string };

export function FilterButton({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex min-h-9 min-w-0 items-center justify-center rounded-sm border px-2.5 py-1.5 text-left font-mono text-[0.68rem] leading-tight transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal",
        active
          ? "border-accent bg-accent/10 text-accent"
          : "border-border-soft bg-surface-1/50 text-muted-foreground hover:border-accent/40 hover:text-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function FilterOptionGrid({
  options,
  selected,
  onToggle,
  scroll = false,
}: {
  options: readonly FilterOption[];
  selected: readonly string[];
  onToggle: (value: string) => void;
  scroll?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-1.5",
        scroll && "max-h-56 overflow-y-auto pr-1 scrollbar-thin",
      )}
    >
      {options.map((option) => (
        <FilterButton
          key={option.value}
          active={selected.includes(option.value)}
          onClick={() => onToggle(option.value)}
          className="w-full justify-start"
        >
          <span className="truncate">{option.label}</span>
        </FilterButton>
      ))}
    </div>
  );
}

export function FilterChip({
  label,
  onRemove,
  className,
}: {
  label: string;
  onRemove: () => void;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "group inline-flex items-center gap-1.5 rounded-sm border border-border-soft bg-surface-1/50 px-2 py-0.5 font-mono text-[0.65rem] transition-colors hover:border-accent/60 hover:bg-accent/5 hover:text-accent",
        className,
      )}
    >
      <span className="leading-none">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="flex size-6 shrink-0 items-center justify-center rounded-sm transition-colors hover:bg-accent/20 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-signal"
        aria-label={`Remove ${label}`}
      >
        <XIcon className="size-3" />
      </button>
    </span>
  );
}
