"use client";

import { useState } from "react";
import { AiringItemCard } from "@/components/airing/airing-item-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import type { AiringScheduleItem } from "@/lib/anilist/types";
import {
  formatLocalDate,
  getRelativeDayLabel,
  getWeekdayShortLabel,
  parseLocalDateKey,
} from "@/lib/anilist/utils/datetime";
import { cn } from "@/lib/utils";

type AiringScheduleInteractiveProps = {
  schedules: readonly AiringScheduleItem[];
  dateKeys: readonly string[];
  grouped: Readonly<Record<string, readonly AiringScheduleItem[]>>;
  todayKey: string;
  timezoneLabel: string;
  weekRangeLabel: { start: string; end: string };
};

export function AiringScheduleInteractive({
  schedules,
  dateKeys,
  grouped,
  todayKey,
  timezoneLabel,
  weekRangeLabel,
}: AiringScheduleInteractiveProps) {
  const [selectedDay, setSelectedDay] = useState(todayKey);
  const activeDay = dateKeys.includes(selectedDay) ? selectedDay : todayKey;
  const activeItems = grouped[activeDay] ?? [];
  const activeDate = parseLocalDateKey(activeDay);
  const totalShows = schedules.length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium">
            Week of {weekRangeLabel.start} – {weekRangeLabel.end}
          </p>
          <p className="text-xs text-muted-foreground">
            {totalShows} {totalShows === 1 ? "episode" : "episodes"} this week
          </p>
        </div>
        <span className="inline-flex items-center rounded-md border border-transparent bg-secondary px-1.5 py-0 text-[10px] font-normal text-secondary-foreground">
          {timezoneLabel}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1 rounded-lg border border-border bg-muted/30 p-1">
        {dateKeys.map((dateKey) => {
          const count = grouped[dateKey]?.length ?? 0;
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
              <span className="text-[11px] font-medium tabular-nums opacity-80">
                {count}
              </span>
            </Button>
          );
        })}
      </div>

      <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:p-5">
        <header className="flex flex-wrap items-end justify-between gap-2 border-b border-border pb-4">
          <div>
            <h2 className="text-lg font-medium tracking-tight">
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
          <p className="text-sm font-medium tabular-nums text-muted-foreground">
            {activeItems.length} {activeItems.length === 1 ? "show" : "shows"}
          </p>
        </header>

        {activeItems.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activeItems.map((item) => (
              <div key={item.id} className="airing-item-cell">
                <AiringItemCard item={item} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No shows scheduled"
            description="Nothing is airing on this day. Try another weekday above."
          />
        )}
      </section>
    </div>
  );
}
