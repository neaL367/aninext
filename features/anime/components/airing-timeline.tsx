import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { getAiringWeek } from "@/features/anime/anime-queries";
import type { AiringScheduleNode } from "@/features/anime/types/anime";
import { getTitle, fromAiringTimestamp } from "@/features/anime/lib/media-helpers";
import { CalendarIcon } from "lucide-react";

export async function AiringTimeline({ day }: { day: string }) {
  const date = new Date(day);
  const start = Math.floor(date.setHours(0, 0, 0, 0) / 1000);
  const end = start + 86400;

  const schedules = await getAiringWeek(start, end);

  if (schedules.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CalendarIcon />
          </EmptyMedia>
          <EmptyTitle>Nothing airing today</EmptyTitle>
        </EmptyHeader>
        <EmptyContent>
          <EmptyDescription>
            Check back tomorrow or try a different day.
          </EmptyDescription>
        </EmptyContent>
      </Empty>
    );
  }

  const grouped = groupByTimeBlock(schedules);

  return (
    <div className="flex flex-col gap-6">
      {Object.entries(grouped).map(([block, items]) => (
        <div key={block} className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {block}
            </h3>
            <div className="h-px flex-1 bg-border-soft" />
          </div>
          <div className="flex flex-col gap-1.5">
            {items.map((item, i) => (
              <AiringRow key={`${item.media?.id}-${i}`} item={item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function AiringRow({ item }: { item: AiringScheduleNode }) {
  if (!item.media) return null;
  const title = getTitle(item.media.title);
  const cover = item.media.coverImage.medium;
  const time = fromAiringTimestamp(item.airingAt);

  return (
    <Link href={`/anime/${item.media.id}` as Route<string>} className="group">
      <div className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-surface-2/50">
        {cover && (
          <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
            <Image
              src={cover}
              alt={title}
              fill
              sizes="48px"
              className="object-cover"
              loading="lazy"
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{title}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono tabular-nums">Episode {item.episode}</span>
            <span>·</span>
            <span className="font-mono tabular-nums">
              {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>
        {item.media.format && (
          <Badge variant="outline" className="shrink-0 rounded-full border-border/60 bg-transparent text-[10px]">
            {item.media.format}
          </Badge>
        )}
      </div>
    </Link>
  );
}

function groupByTimeBlock(schedules: AiringScheduleNode[]): Record<string, AiringScheduleNode[]> {
  const blocks: Record<string, AiringScheduleNode[]> = {
    "Morning (6:00 – 12:00)": [],
    "Afternoon (12:00 – 18:00)": [],
    "Evening (18:00 – 00:00)": [],
    "Late Night (00:00 – 6:00)": [],
  };

  for (const item of schedules) {
    const hour = fromAiringTimestamp(item.airingAt).getHours();
    if (hour >= 6 && hour < 12) blocks["Morning (6:00 – 12:00)"].push(item);
    else if (hour >= 12 && hour < 18) blocks["Afternoon (12:00 – 18:00)"].push(item);
    else if (hour >= 18 && hour < 24) blocks["Evening (18:00 – 00:00)"].push(item);
    else blocks["Late Night (00:00 – 6:00)"].push(item);
  }

  return Object.fromEntries(Object.entries(blocks).filter(([, items]) => items.length > 0));
}

export function AiringTimelineSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <Skeleton className="h-4 w-40 rounded" />
          <div className="flex flex-col gap-1.5">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="flex items-center gap-3 rounded-xl p-2.5">
                <Skeleton className="h-16 w-12 shrink-0 rounded-md" />
                <div className="flex-1 flex flex-col gap-2">
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-3 w-1/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
