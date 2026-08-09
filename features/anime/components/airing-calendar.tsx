"use client";

import Link from "next/link";
import { useMemo } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { localDateStr } from "@/features/anime/lib/media-helpers";
import { cn } from "@/lib/utils";

export function AiringCalendar({ currentDay }: { currentDay: string }) {
  "use memo";
  const localToday = useMemo(() => localDateStr(), []);
  const weekDays = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }).map((_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + index);
      return localDateStr(date);
    });
  }, []);

  return (
    <nav
      className="grid grid-cols-7 rounded-lg border border-border-soft bg-surface-1/40 backdrop-blur-md overflow-hidden"
      aria-label="Airing days"
    >
      {weekDays.map((day) => {
        const date = new Date(day + "T00:00:00");
        const isToday = day === localToday;
        const isSelected = day === currentDay;
        return (
          <Link
            key={day}
            href={`/airing?day=${day}`}
            prefetch={isSelected ? false : undefined}
            aria-current={isSelected ? "date" : undefined}
            className={cn(
              "group relative flex min-h-20 sm:min-h-24 flex-col justify-between border-r border-border-soft px-3 py-3.5 transition-colors last:border-r-0",
              isSelected ? "bg-surface-2 text-foreground" : "hover:bg-surface-1/80",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-muted-foreground">
                {date.toLocaleDateString("en-US", { weekday: "short" })}
              </span>
              {isToday && (
                <span className="font-mono text-[0.58rem] font-bold uppercase tracking-wider text-destructive bg-destructive/10 px-1.5 py-0.5 rounded border border-destructive/20">
                  Today
                </span>
              )}
            </div>
            <span
              className={cn(
                "font-mono text-2xl font-semibold tabular-nums sm:text-3xl tracking-tight",
                isSelected
                  ? "text-signal"
                  : "text-foreground group-hover:text-signal transition-colors",
              )}
            >
              {date.getDate()}
            </span>
            {isSelected && (
              <span
                className="absolute bottom-0 left-0 h-0.5 w-full bg-signal"
                aria-label="Selected"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function AiringCalendarSkeleton() {
  return (
    <div className="grid grid-cols-7 border-y border-border-soft">
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-none border-r border-border-soft" />
      ))}
    </div>
  );
}
