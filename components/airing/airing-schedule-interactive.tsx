"use client";

import { useMemo, useState } from "react";
import {
  AiringDayCountSuspense,
  AiringDayListSuspense,
  AiringDayShowCountSuspense,
} from "@/components/airing/airing-day-chunks";
import { Button } from "@/components/ui/button";
import type { AiringScheduleItem } from "@/lib/anilist/domain/types";
import {
  formatLocalDate,
  formatTimezoneLabel,
  getRelativeDayLabel,
  getUserTimezone,
  getWeekdayShortLabel,
  parseLocalDateKey,
  toLocalDateKeyFromDate,
} from "@/lib/anilist/display/datetime";
import { cn } from "@/lib/utils";

type AiringDayPromises = Record<string, Promise<AiringScheduleItem[]>>;

type AiringScheduleInteractiveProps = {
  dateKeys: readonly string[];
  dayPromises: AiringDayPromises;
};

function buildWeekRangeLabel(dateKeys: readonly string[]) {
  const start = parseLocalDateKey(dateKeys[0]!);
  const end = parseLocalDateKey(dateKeys[6]!);
  return {
    start: formatLocalDate(start, { month: "long", day: "numeric" }),
    end: formatLocalDate(end, {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
  };
}

export function AiringScheduleInteractive({
  dateKeys,
  dayPromises,
}: AiringScheduleInteractiveProps) {
  "use memo";

  const { todayKey, timezoneLabel, weekRangeLabel } = useMemo(() => {
    return {
      todayKey: toLocalDateKeyFromDate(new Date()),
      timezoneLabel: formatTimezoneLabel(getUserTimezone()),
      weekRangeLabel: buildWeekRangeLabel(dateKeys),
    };
  }, [dateKeys]);

  const [selectedDay, setSelectedDay] = useState(todayKey);
  const activeDay = dateKeys.includes(selectedDay) ? selectedDay : todayKey;
  const activePromise = dayPromises[activeDay];
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
          const promise = dayPromises[dateKey];

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
              {promise ? (
                <AiringDayCountSuspense promise={promise} />
              ) : (
                <span className="text-[11px] font-medium tabular-nums opacity-40">
                  —
                </span>
              )}
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
          <div className="text-sm font-medium tabular-nums text-muted-foreground">
            {activePromise ? (
              <AiringDayShowCountSuspense promise={activePromise} />
            ) : (
              "—"
            )}
          </div>
        </header>

        {activePromise ? (
          <AiringDayListSuspense key={activeDay} promise={activePromise} />
        ) : null}
      </section>
    </div>
  );
}
