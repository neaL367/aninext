import { Skeleton } from "@/components/ui/skeleton";

import { AnimeAiringScheduleList } from "./anime-airing-schedule-list";

import type { AiringScheduleNode } from "@/features/anime/types/anime";

export function AnimeAiringSchedule({ nodes }: { nodes: AiringScheduleNode[] }) {
  "use memo";
  if (nodes.length === 0) return null;

  return (
    <>
      <h2 className="mb-4 border-b border-border-soft pb-3 font-serif text-2xl leading-none tracking-[-0.03em]">
        Next episodes
      </h2>
      <AnimeAiringScheduleList nodes={nodes} />
    </>
  );
}

export function AnimeAiringScheduleSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between border-b border-border-soft py-2.5"
        >
          <Skeleton className="h-3.5 w-20 rounded-[2px]" />
          <Skeleton className="h-3 w-24 rounded-[2px]" />
        </div>
      ))}
    </div>
  );
}
