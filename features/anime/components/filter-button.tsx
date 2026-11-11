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
        "flex min-h-8 min-w-0 items-center justify-start rounded-[2px] px-2 py-1 text-left font-mono text-[0.8125rem] leading-tight transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal",
        active
          ? "bg-signal text-white"
          : "text-muted-foreground hover:bg-surface-1 hover:text-foreground",
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
        "grid grid-cols-2 gap-0.5",
        scroll && "max-h-[min(18rem,45vh)] overflow-y-auto pr-1 scrollbar-thin",
      )}
    >
      {options.map((option) => (
        <FilterButton
          key={option.value}
          active={selected.includes(option.value)}
          onClick={() => onToggle(option.value)}
          className="w-full"
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
  "use memo";
  return (
    <span
      className={cn(
        "group inline-flex items-center gap-1 rounded-[2px] bg-surface-1 px-2 py-1 font-mono text-[0.8125rem] text-foreground transition-colors hover:text-foreground",
        className,
      )}
    >
      <span className="leading-none">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="flex size-4 shrink-0 items-center justify-center rounded-[2px] text-muted-foreground transition-colors hover:bg-signal hover:text-white focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-signal"
        aria-label={`Remove ${label}`}
      >
        <XIcon className="size-2.5" />
      </button>
    </span>
  );
}
