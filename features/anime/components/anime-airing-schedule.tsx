import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyHeader, EmptyTitle, EmptyMedia } from "@/components/ui/empty";
import { CalendarIcon } from "lucide-react";
import type { AiringScheduleNode } from "@/features/anime/types/anime";
import { getAnimeAiringSchedule } from "@/features/anime/anime-queries";
import { fromAiringTimestamp } from "@/features/anime/lib/media-helpers";

export async function AnimeAiringSchedule({
  id,
  nodes: nodesProp,
}: {
  id?: number;
  nodes?: AiringScheduleNode[];
}) {
  const nodes = nodesProp !== undefined ? nodesProp : await getAnimeAiringSchedule(id!);

  if (nodes.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CalendarIcon />
          </EmptyMedia>
          <EmptyTitle>No upcoming episodes</EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Schedule</h2>
      <div className="flex flex-col gap-2">
        {nodes.map((node) => {
          const date = fromAiringTimestamp(node.airingAt);
          return (
            <div key={node.episode} className="flex items-center justify-between rounded-lg border border-border-soft bg-surface-2/30 p-3">
              <span className="text-sm font-medium">Episode {node.episode}</span>
              <time
                dateTime={date.toISOString()}
                className="font-mono text-xs text-muted-foreground tabular-nums"
              >
                {date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </time>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AnimeAiringScheduleSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="h-7 w-24 rounded-md shimmer" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between rounded-lg border border-border-soft bg-surface-2/30 p-3">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-3 w-28 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
