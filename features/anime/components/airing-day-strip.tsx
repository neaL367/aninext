"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";

import { isValidAiringOffset, type AiringContext } from "@/features/anime/lib/airing";
import {
  getLocalOffsetMinutes,
  getOffsetHour,
  getOffsetTodayStr,
} from "@/features/anime/lib/media-helpers";
import { cn } from "@/lib/utils";

import type { AiringScheduleNode } from "@/features/anime/types/anime";
import type { Route } from "next";

export function AiringDayStrip({
  currentDay,
  week,
  today,
  schedules,
  context,
}: {
  currentDay: string;
  week: { day: string; count: number }[];
  today: string;
  schedules: AiringScheduleNode[];
  context: AiringContext;
}) {
  "use memo";
  // Visitor timezone, hydration-safe without an effect: unknown (undefined)
  // during SSR/prerender, local offset after hydration. Never changes within
  // a session, so the subscription is a noop.
  const browserOffset = useSyncExternalStore<number | undefined>(
    () => () => {},
    () => getLocalOffsetMinutes(),
    () => undefined,
  );

  // Display timezone: known visitor offset, if any, else the browser's after
  // hydration (SSR-safe: unknown during prerender). Day links are always
  // clean (`/airing/2026-09-13`) — timezone resolves from the tz_offset
  // cookie server-side, never from the URL.
  const displayOffset =
    typeof context.offsetMinutes === "number" && isValidAiringOffset(context.offsetMinutes)
      ? context.offsetMinutes
      : browserOffset;
  const offset = displayOffset ?? 0;
  const nowHour = useMemo(() => getOffsetHour(Date.now() / 1000, offset), [offset]);
  const isTodayDay = useMemo(() => currentDay === getOffsetTodayStr(offset), [currentDay, offset]);

  const bandHours = useMemo(() => {
    const hours = new Set<number>();
    for (const schedule of schedules) {
      if (!schedule.media) continue;
      hours.add(getOffsetHour(schedule.airingAt, offset));
    }
    return [...hours].sort((a, b) => a - b);
  }, [schedules, offset]);

  return (
    <div className="sticky top-14 z-40 -mx-4 border-b border-border-soft bg-background/85 backdrop-blur-2xl sm:-mx-7 lg:-mx-10">
      <div className="mx-auto w-full max-w-[1760px] px-4 sm:px-7 lg:px-10">
        <nav className="no-scrollbar flex items-end gap-1 overflow-x-auto" aria-label="Airing days">
          {week.map(({ day, count }) => {
            const date = new Date(day + "T00:00:00");
            const isToday = day === today;
            const isSelected = day === currentDay;
            return (
              <Link
                key={day}
                href={`/airing/${day}` as Route}
                prefetch={isSelected ? false : undefined}
                aria-current={isSelected ? "date" : undefined}
                className={cn(
                  "group relative flex min-w-[4rem] snap-start flex-col items-center gap-0.5 px-2 pb-2.5 pt-3 transition-colors sm:min-w-0 sm:flex-1",
                  isSelected ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "font-mono text-[0.55rem] uppercase tracking-[0.18em]",
                    isToday ? "text-signal" : "opacity-60 group-hover:opacity-100",
                  )}
                >
                  {date.toLocaleDateString("en-US", { weekday: "short" })}
                </span>
                <span
                  className={cn(
                    "font-serif text-2xl leading-none tabular-nums sm:text-3xl",
                    isSelected ? "text-signal" : "text-foreground",
                  )}
                >
                  {date.getDate()}
                </span>
                <span
                  className={cn(
                    "font-mono text-[0.5rem] uppercase tracking-[0.1em]",
                    isToday ? "text-signal" : "text-muted-foreground/50",
                  )}
                >
                  {isToday ? "Today" : count > 0 ? count : "—"}
                </span>
                {isSelected && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-1 -bottom-px h-px rounded-full bg-signal"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {bandHours.length > 0 && (
          <nav
            className="no-scrollbar flex items-center gap-4 overflow-x-auto border-t border-border-soft/60 py-2"
            aria-label="Jump to hour"
          >
            {bandHours.map((hour) => {
              const isNow = isTodayDay && hour === nowHour;
              return (
                <a
                  key={hour}
                  href={`#band-${hour}`}
                  onClick={(event) => {
                    event.preventDefault();
                    document
                      .getElementById(`band-${hour}`)
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={cn(
                    "flex shrink-0 items-center gap-1 font-mono text-[0.58rem] tabular-nums transition-colors",
                    isNow ? "text-signal" : "text-muted-foreground/60 hover:text-foreground",
                  )}
                >
                  {isNow && <span className="size-1 rounded-full bg-signal" />}
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
    <div className="sticky top-14 z-40 -mx-4 border-b border-border-soft bg-background/85 backdrop-blur-2xl sm:-mx-7 lg:-mx-10">
      <div className="mx-auto w-full max-w-[1760px] px-4 sm:px-7 lg:px-10">
        <div className="flex items-end gap-1">
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              key={index}
              className="flex min-w-[4rem] flex-1 flex-col items-center gap-1.5 px-2 pb-2.5 pt-3"
            >
              <div className="shimmer h-2.5 w-8 rounded-[2px]" />
              <div className="shimmer h-6 w-7 rounded-[2px]" />
              <div className="shimmer h-2 w-6 rounded-[2px]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
