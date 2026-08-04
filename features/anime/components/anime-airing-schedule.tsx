import { Skeleton } from "@/components/ui/skeleton";
import { getAnimeAiringSchedule } from "@/features/anime/anime-queries";
import { AnimeAiringScheduleClient } from "./anime-airing-schedule-client";

export async function AnimeAiringScheduleAsync({ id }: { id: number }) {
  const nodes = await getAnimeAiringSchedule(id);
  return <AnimeAiringScheduleClient nodes={nodes} />;
}

export function AnimeAiringScheduleSkeleton() {
  return (
    <div>
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
