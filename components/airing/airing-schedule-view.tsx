"use client";

import { useState } from "react";
import { AiringItemCard } from "@/components/airing/airing-item-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AiringScheduleItem } from "@/lib/anilist/types";
import {
  formatLocalDate,
  formatTimezoneLabel,
  getRelativeDayLabel,
  getUserTimezone,
  getWeekDateKeys,
  getWeekdayShortLabel,
  groupByLocalDate,
  parseLocalDateKey,
  toLocalDateKeyFromDate,
} from "@/lib/anilist/utils/datetime";
import { cn } from "@/lib/utils";

type AiringScheduleViewProps = {
  schedules: readonly AiringScheduleItem[];
};

export function AiringScheduleView({ schedules }: AiringScheduleViewProps) {
  const timezone = getUserTimezone();
  const todayKey = toLocalDateKeyFromDate(new Date());
  const dateKeys = getWeekDateKeys();
  const grouped = groupByLocalDate(schedules);
  const [selectedDay, setSelectedDay] = useState(todayKey);

  const activeDay = dateKeys.includes(selectedDay) ? selectedDay : todayKey;
  const activeItems = grouped.get(activeDay) ?? [];
  const activeDate = parseLocalDateKey(activeDay);

  const start = parseLocalDateKey(dateKeys[0]!);
  const end = parseLocalDateKey(dateKeys[6]!);
  const weekRangeLabel = {
    start: formatLocalDate(start, { month: "long", day: "numeric" }),
    end: formatLocalDate(end, {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
  };

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
        <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-normal">
          {formatTimezoneLabel(timezone)}
        </Badge>
      </div>

      <div className="grid grid-cols-7 gap-1 rounded-lg border border-border bg-muted/30 p-1">
        {dateKeys.map((dateKey) => {
          const count = grouped.get(dateKey)?.length ?? 0;
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
          <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
            {activeItems.map((item) => (
              <AiringItemCard key={item.id} item={item} />
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
