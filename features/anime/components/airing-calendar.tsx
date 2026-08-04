import Link from "next/link";
import type { Route } from "next";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function AiringCalendar({ currentDay, today }: { currentDay: string; today: string }) {
  const todayDate = new Date(today);
  const days = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(todayDate);
    date.setDate(todayDate.getDate() + i);
    return date.toISOString().split("T")[0];
  });

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
      {days.map((day) => {
        const date = new Date(day);
        const isToday = day === today;
        const isSelected = day === currentDay;

        return (
          <Link
            key={day}
            href={`/airing?day=${day}` as Route<string>}
            className={cn(
              "flex w-20 shrink-0 flex-col items-center gap-1 rounded-xl py-3 transition-all duration-200",
              isSelected
                ? "bg-accent/10 text-accent ring-1 ring-accent/30"
                : "hover:bg-surface-2/50"
            )}
          >
            <span className={cn(
              "text-xs font-semibold uppercase tracking-wider",
              isSelected ? "text-accent" : "text-muted-foreground"
            )}>
              {date.toLocaleDateString("en-US", { weekday: "short" })}
            </span>
            <span className={cn(
              "text-2xl font-bold tabular-nums",
              isSelected ? "text-accent" : "text-foreground"
            )}>
              {date.getDate()}
            </span>
            {isToday && !isSelected && (
              <span className="size-1.5 rounded-full bg-accent" />
            )}
          </Link>
        );
      })}
    </div>
  );
}

export function AiringCalendarSkeleton() {
  return (
    <div className="flex gap-2 overflow-hidden">
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-20 shrink-0 rounded-xl" />
      ))}
    </div>
  );
}
