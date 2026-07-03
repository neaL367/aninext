"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AiringDayCountFallback,
  AiringDayListSuspense,
  AiringDayShowCountSuspense,
  AiringDayTabCountBadge,
} from "@/components/airing/airing-day-chunks";
import { Button } from "@/components/ui/button";
import { loadAiringWeekCountsClient } from "@/lib/anilist/client/airing-week-counts-load";
import { loadAiringDayClient } from "@/lib/anilist/client/airing-day-load";
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

type AiringScheduleInteractiveProps = {
  dateKeys: readonly string[];
  priorityDateKey: string;
  initialDayPromise: Promise<AiringScheduleItem[]>;
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
  priorityDateKey,
  initialDayPromise,
}: AiringScheduleInteractiveProps) {
  "use memo";

  const { todayKey, timezoneLabel, weekRangeLabel } = useMemo(() => {
    return {
      todayKey: toLocalDateKeyFromDate(new Date()),
      timezoneLabel: formatTimezoneLabel(getUserTimezone()),
      weekRangeLabel: buildWeekRangeLabel(dateKeys),
    };
  }, [dateKeys]);

  const [selectedDay, setSelectedDay] = useState(priorityDateKey);
  const [dayCounts, setDayCounts] = useState<Record<string, number>>({});
  const [dayPromises, setDayPromises] = useState<Record<string, Promise<AiringScheduleItem[]>>>(
    () => ({
      [priorityDateKey]: initialDayPromise,
    }),
  );
  const dayPromisesRef = useRef(dayPromises);
  dayPromisesRef.current = dayPromises;
  const loadedCountsRef = useRef(new Set<string>());

  useEffect(() => {
    let cancelled = false;

    void initialDayPromise.then((items) => {
      if (cancelled || loadedCountsRef.current.has(priorityDateKey)) {
        return;
      }

      loadedCountsRef.current.add(priorityDateKey);
      setDayCounts((current) => ({ ...current, [priorityDateKey]: items.length }));
    });

    return () => {
      cancelled = true;
    };
  }, [initialDayPromise, priorityDateKey]);

  useEffect(() => {
    let cancelled = false;

    void loadAiringWeekCountsClient(dateKeys)
      .then((counts) => {
        if (cancelled) {
          return;
        }

        for (const dateKey of Object.keys(counts)) {
          loadedCountsRef.current.add(dateKey);
        }

        setDayCounts((current) => ({ ...current, ...counts }));
      })
      .catch(() => {
        // Keep pulse badges — user can still open a day for a full retry.
      });

    return () => {
      cancelled = true;
    };
  }, [dateKeys]);

  const handleSelectDay = useCallback((dateKey: string) => {
    setSelectedDay(dateKey);

    if (dateKey in dayPromisesRef.current) {
      return;
    }

    const promise = loadAiringDayClient(dateKey);
    setDayPromises((current) =>
      dateKey in current ? current : { ...current, [dateKey]: promise },
    );

    void promise.then((items) => {
      if (loadedCountsRef.current.has(dateKey)) {
        return;
      }

      loadedCountsRef.current.add(dateKey);
      setDayCounts((current) => ({ ...current, [dateKey]: items.length }));
    });
  }, []);

  const activeDay = dateKeys.includes(selectedDay) ? selectedDay : priorityDateKey;
  const activePromise = activeDay in dayPromises ? dayPromises[activeDay] : undefined;
  const activeDate = parseLocalDateKey(activeDay);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium">
            Week of {weekRangeLabel.start} – {weekRangeLabel.end}
          </p>
          <p className="text-xs text-muted-foreground">
            Show counts per weekday — select a day for the full schedule
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
                isToday && !isSelected && "ring-1 ring-primary/30",
              )}
              onClick={() => handleSelectDay(dateKey)}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wide">
                {getWeekdayShortLabel(dateKey)}
              </span>
              <AiringDayTabCountBadge count={dayCounts[dateKey]} />
            </Button>
          );
        })}
      </div>

      <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:p-5">
        <header className="flex flex-wrap items-end justify-between gap-2 border-b border-border pb-4">
          <div>
            <h2 suppressHydrationWarning className="text-lg font-medium tracking-tight">
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
            ) : dayCounts[activeDay] !== undefined ? (
              <>
                {dayCounts[activeDay]} {dayCounts[activeDay] === 1 ? "show" : "shows"}
              </>
            ) : (
              <AiringDayCountFallback />
            )}
          </div>
        </header>

        {activePromise ? <AiringDayListSuspense key={activeDay} promise={activePromise} /> : null}
      </section>
    </div>
  );
}
