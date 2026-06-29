import { AiringItemCard } from "@/components/airing/airing-item-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import type { AiringScheduleItem } from "@/lib/anilist/types";
import {
  formatLocalDate,
  formatTimezoneLabel,
  getRelativeDayLabel,
  getUserTimezone,
  groupByLocalDate,
} from "@/lib/anilist/utils/datetime";
import { cn } from "@/lib/utils";

type AiringScheduleViewProps = {
  schedules: readonly AiringScheduleItem[];
};

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function AiringScheduleView({ schedules }: AiringScheduleViewProps) {
  const timezone = getUserTimezone();
  const today = new Date();
  const todayKey = toDateKey(today);

  if (!schedules.length) {
    return (
      <EmptyState
        title="No airing schedules this week"
        description="Check back later — new episodes are added as schedules are announced."
      />
    );
  }

  const grouped = groupByLocalDate(schedules);
  const dateKeys = [...grouped.keys()].sort();

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1.5 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <p className="text-xs font-medium text-muted-foreground">Today</p>
          <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-normal">
            {formatTimezoneLabel(timezone)}
          </Badge>
        </div>
        <h2 className="text-xl font-semibold tracking-tight">
          {formatLocalDate(today)}
        </h2>
      </header>

      {dateKeys.map((dateKey) => {
        const items = grouped.get(dateKey) ?? [];
        const [y, m, d] = dateKey.split("-").map(Number);
        const headerDate = new Date(y!, m! - 1, d!);
        const isToday = dateKey === todayKey;

        return (
          <section key={dateKey} className="flex flex-col gap-3">
            <div
              className={cn(
                "flex items-end justify-between gap-3 rounded-lg border px-3 py-2.5",
                isToday
                  ? "border-primary/25 bg-primary/5"
                  : "border-border bg-muted/20"
              )}
            >
              <div>
                <h3 className="text-base font-medium tracking-tight">
                  {getRelativeDayLabel(dateKey)}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {formatLocalDate(headerDate, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <p className="text-xs font-medium tabular-nums text-muted-foreground">
                {items.length} {items.length === 1 ? "show" : "shows"}
              </p>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <AiringItemCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
