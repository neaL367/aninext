import { AiringScheduleInteractive } from "@/components/airing/airing-schedule-interactive";
import type { AiringScheduleItem } from "@/lib/anilist/types";
import {
  formatLocalDate,
  formatTimezoneLabel,
  getUserTimezone,
  getWeekDateKeys,
  groupByLocalDate,
  parseLocalDateKey,
  toLocalDateKeyFromDate,
} from "@/lib/anilist/utils/datetime";

type AiringScheduleViewProps = {
  schedules: readonly AiringScheduleItem[];
};

export function AiringScheduleView({ schedules }: AiringScheduleViewProps) {
  const timezone = getUserTimezone();
  const todayKey = toLocalDateKeyFromDate(new Date());
  const dateKeys = getWeekDateKeys();
  const grouped = groupByLocalDate(schedules);
  const groupedRecord = Object.fromEntries(grouped) as Record<
    string,
    readonly AiringScheduleItem[]
  >;

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

  return (
    <AiringScheduleInteractive
      schedules={schedules}
      dateKeys={dateKeys}
      grouped={groupedRecord}
      todayKey={todayKey}
      timezoneLabel={formatTimezoneLabel(timezone)}
      weekRangeLabel={weekRangeLabel}
    />
  );
}
