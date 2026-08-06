"use client";

import Link from "next/link";
import { useMemo } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { localDateStr } from "@/features/anime/lib/media-helpers";
import { cn } from "@/lib/utils";

export function AiringCalendar({ currentDay }: { currentDay: string }) {
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
    <nav className="grid grid-cols-7 border-y border-border-soft" aria-label="Airing days">
      {weekDays.map((day) => {
        const date = new Date(day + "T00:00:00");
        const isToday = day === localToday;
        const isSelected = day === currentDay;
        return (
          <Link
            key={day}
            href={`/airing?day=${day}`}
            prefetch={isSelected ? false : undefined}
            className={cn(
              "group relative flex min-h-20 flex-col justify-between border-r border-border-soft px-2 py-3 transition-colors last:border-r-0 sm:min-h-24 sm:px-4 sm:py-4",
              isSelected ? "bg-signal-soft text-foreground" : "hover:bg-surface-1",
            )}
          >
            <span className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-muted-foreground">
              {date.toLocaleDateString("en-US", { weekday: "short" })}
            </span>
            <span
              className={cn(
                "font-mono text-2xl tabular-nums sm:text-3xl",
                isSelected ? "text-signal" : "text-foreground",
              )}
            >
              {date.getDate()}
            </span>
            {isToday && (
              <span
                className="absolute bottom-0 left-0 h-1 w-full bg-live-badge"
                aria-label="Today"
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
