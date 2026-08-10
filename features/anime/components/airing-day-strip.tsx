"use client";

import Link from "next/link";
import { useMemo } from "react";

import {
  getLocalOffsetMinutes,
  getOffsetHour,
  getOffsetTodayStr,
} from "@/features/anime/lib/media-helpers";
import { cn } from "@/lib/utils";

import type { AiringScheduleNode } from "@/features/anime/types/anime";

export function AiringDayStrip({
  currentDay,
  week,
  today,
  schedules,
  offsetMinutes,
}: {
  currentDay: string;
  week: { day: string; count: number }[];
  today: string;
  schedules: AiringScheduleNode[];
  offsetMinutes?: number;
}) {
  "use memo";
  const offset = useMemo(
    () =>
      typeof offsetMinutes === "number" && Number.isFinite(offsetMinutes)
        ? offsetMinutes
        : getLocalOffsetMinutes(),
    [offsetMinutes],
  );
  const nowHour = useMemo(() => getOffsetHour(Date.now() / 1000, offset), [offset]);
  // The "now" marker only applies when the selected day is actually today in
  // the offset's timezone — otherwise it would light up on a past/future day's
  // bands (e.g. a stale URL after midnight shows "now" on yesterday).
  const isTodayDay = useMemo(() => currentDay === getOffsetTodayStr(offset), [currentDay, offset]);

  // Hour bands present in this day's schedule (e.g. [5, 6, 7, 9, 11, ...]) for
  // the quick-jump navigator — in the offset's timezone, matching the fetch.
  const bandHours = useMemo(() => {
    const hours = new Set<number>();
    for (const s of schedules) {
      if (!s.media) continue;
      hours.add(getOffsetHour(s.airingAt, offset));
    }
    return [...hours].sort((a, b) => a - b);
  }, [schedules, offset]);

  return (
    <div className="sticky top-16 z-40 -mx-4 border-b border-border-soft bg-background/90 backdrop-blur-xl sm:-mx-7 lg:-mx-10">
      <div className="mx-auto w-full max-w-[1680px] px-4 sm:px-7 lg:px-10">
        {/* Day tabs */}
        <nav className="no-scrollbar flex items-end gap-1 overflow-x-auto" aria-label="Airing days">
          {week.map(({ day, count }) => {
            const date = new Date(day + "T00:00:00");
            const isToday = day === today;
            const isSelected = day === currentDay;
            return (
              <Link
                key={day}
                href={`/airing?day=${day}&offset=${offset}`}
                prefetch={isSelected ? false : undefined}
                aria-current={isSelected ? "date" : undefined}
                className={cn(
                  "group relative flex min-w-[4.4rem] snap-start flex-col items-center gap-0.5 px-2 pb-2.5 pt-3 transition-colors sm:min-w-0 sm:flex-1",
                  isSelected ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "font-mono text-[0.62rem] font-bold uppercase tracking-[0.16em]",
                    isToday ? "text-destructive" : "opacity-70 group-hover:opacity-100",
                  )}
                >
                  {date.toLocaleDateString("en-US", { weekday: "short" })}
                </span>
                <span
                  className={cn(
                    "font-mono text-2xl font-semibold tabular-nums tracking-tight transition-colors sm:text-3xl",
                    isSelected ? "text-signal" : "text-foreground group-hover:text-signal",
                  )}
                >
                  {date.getDate()}
                </span>
                <span
                  className={cn(
                    "font-mono text-[0.6rem] font-bold tabular-nums",
                    isToday
                      ? "text-destructive"
                      : "text-muted-foreground/70 group-hover:text-muted-foreground",
                  )}
                >
                  {isToday ? "Today" : count > 0 ? `${count} eps` : "—"}
                </span>
                {isSelected && (
                  <span className="absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-signal" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Hour quick-jump navigator */}
        {bandHours.length > 0 && (
          <nav
            className="no-scrollbar flex items-center gap-1 overflow-x-auto border-t border-border-soft/60 py-1.5"
            aria-label="Jump to hour"
          >
            {bandHours.map((hour) => {
              const isNow = isTodayDay && hour === nowHour;
              return (
                <a
                  key={hour}
                  href={`#band-${hour}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .getElementById(`band-${hour}`)
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={cn(
                    "flex shrink-0 items-center gap-1 rounded-md px-2 py-1 font-mono text-[0.62rem] font-bold tabular-nums transition-colors",
                    isNow
                      ? "bg-destructive/15 text-destructive"
                      : "text-muted-foreground hover:bg-surface-1 hover:text-foreground",
                  )}
                >
                  {isNow && <span className="size-1 animate-pulse rounded-full bg-destructive" />}
                  {String(hour).padStart(2, "0")}
                </a>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}

export function AiringDayStripSkeleton() {
  return (
    <div className="sticky top-16 z-40 -mx-4 border-b border-border-soft bg-background/90 backdrop-blur-xl sm:-mx-7 lg:-mx-10">
      <div className="mx-auto w-full max-w-[1680px] px-4 sm:px-7 lg:px-10">
        <div className="flex items-end gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="flex min-w-[4.4rem] flex-1 flex-col items-center gap-1.5 px-2 pb-2.5 pt-3"
            >
              <div className="shimmer h-3 w-10 rounded" />
              <div className="shimmer h-7 w-8 rounded" />
              <div className="shimmer h-2.5 w-8 rounded-full" />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1 overflow-hidden border-t border-border-soft/60 py-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="shimmer h-5 w-9 rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}
