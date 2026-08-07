import { Skeleton } from "@/components/ui/skeleton";

import { AnimeAiringScheduleList } from "./anime-airing-schedule-list";

import type { AiringScheduleNode } from "@/features/anime/types/anime";

export function AnimeAiringSchedule({ nodes }: { nodes: AiringScheduleNode[] }) {
  if (nodes.length === 0) return null;

  return (
    <>
      <p className="eyebrow text-signal">Schedule</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">Next episodes</h2>
      <div className="mt-5">
        <AnimeAiringScheduleList nodes={nodes} />
      </div>
    </>
  );
}

export function AnimeAiringScheduleSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-lg border border-border-soft bg-surface-2/30 p-3"
        >
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-3 w-28 rounded" />
        </div>
      ))}
    </div>
  );
}
