"use client";

import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

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
      onClick={onClick}
      className={cn(
        "rounded-sm border px-2 py-1 font-mono text-[0.65rem] transition-colors",
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
        onClick={onRemove}
        className="flex size-3.5 items-center justify-center rounded-sm transition-colors hover:bg-accent/20"
        aria-label={`Remove ${label}`}
      >
        <XIcon className="size-2.5" />
      </button>
    </span>
  );
}
