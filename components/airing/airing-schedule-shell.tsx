"use client";

import { useMemo, useState } from "react";
import { AiringDayListSkeleton } from "@/components/airing/airing-day-chunks";
import { Button } from "@/components/ui/button";
import {
  formatLocalDate,
  formatTimezoneLabel,
  getRelativeDayLabel,
  getUserTimezone,
  getWeekDateKeys,
  getWeekdayShortLabel,
  parseLocalDateKey,
  toLocalDateKeyFromDate,
} from "@/lib/anilist/utils/datetime";
import { cn } from "@/lib/utils";

/** Static shell shown while day promises are wired up; mirrors the interactive layout. */
export function AiringScheduleShell() {
  const { dateKeys, todayKey, timezoneLabel, weekRangeLabel } = useMemo(() => {
    const keys = getWeekDateKeys();
    const start = parseLocalDateKey(keys[0]!);
    const end = parseLocalDateKey(keys[6]!);

    return {
      dateKeys: keys,
      todayKey: toLocalDateKeyFromDate(new Date()),
      timezoneLabel: formatTimezoneLabel(getUserTimezone()),
      weekRangeLabel: {
        start: formatLocalDate(start, { month: "long", day: "numeric" }),
        end: formatLocalDate(end, {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
      },
    };
  }, []);

  const [selectedDay, setSelectedDay] = useState(todayKey);
  const activeDay = dateKeys.includes(selectedDay) ? selectedDay : todayKey;
  const activeDate = parseLocalDateKey(activeDay);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium">
            Week of {weekRangeLabel.start} – {weekRangeLabel.end}
          </p>
          <p className="text-xs text-muted-foreground">
            Episodes load by day — counts appear as each weekday finishes
          </p>
        </div>
        <span
          suppressHydrationWarning
          className="inline-flex items-center rounded-md border border-transparent bg-secondary px-1.5 py-0 text-[10px] font-normal text-secondary-foreground"
        >
          {timezoneLabel}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1 rounded-lg border border-border bg-muted/30 p-1">
        {dateKeys.map((dateKey) => {
          const isToday = dateKey === todayKey;
          const isSelected = dateKey === activeDay;

          return (
            <Button
              key={dateKey}
              type="button"
              variant={isSelected ? "default" : "ghost"}
              size="sm"
              className={cn(
                "h-auto min-w-0 flex-col gap-0.5 px-1 py-2 text-center",
                isToday && !isSelected && "ring-1 ring-primary/30"
              )}
              onClick={() => setSelectedDay(dateKey)}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wide">
                {getWeekdayShortLabel(dateKey)}
              </span>
              <span className="text-[11px] font-medium tabular-nums opacity-40">
                —
              </span>
            </Button>
          );
        })}
      </div>

      <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:p-5">
        <header className="flex flex-wrap items-end justify-between gap-2 border-b border-border pb-4">
          <div>
            <h2
              suppressHydrationWarning
              className="text-lg font-medium tracking-tight"
            >
              {getRelativeDayLabel(activeDay)}
            </h2>
            <p className="text-sm text-muted-foreground">
              {formatLocalDate(activeDate, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <span
            aria-hidden
            className="inline-block h-4 w-16 animate-pulse rounded-md bg-muted"
          />
        </header>

        <AiringDayListSkeleton />
      </section>
    </div>
  );
}
