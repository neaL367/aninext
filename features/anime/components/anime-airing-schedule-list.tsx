import { LocalTime } from "@/components/ui/local-time";

import type { AiringScheduleNode } from "@/features/anime/types/anime";

export function AnimeAiringScheduleList({ nodes }: { nodes: AiringScheduleNode[] }) {
  "use memo";
  if (nodes.length === 0) {
    return null;
  }

  return (
    <div
      tabIndex={0}
      role="list"
      aria-label="Upcoming episodes"
      className="max-h-[260px] divide-y divide-border-soft overflow-y-auto border-t border-border-soft scrollbar-thin focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
    >
      {nodes.map((node) => (
        <div
          key={node.episode}
          role="listitem"
          className="flex items-center justify-between gap-4 py-2.5"
        >
          <span className="flex items-center gap-2 font-mono text-[0.66rem] uppercase tracking-[0.1em] text-foreground/80">
            <span className="size-1 rounded-full bg-signal" />
            Ep {node.episode}
          </span>
          <LocalTime
            timestamp={node.airingAt}
            format="date-time"
            className="font-mono text-[0.66rem] tabular-nums text-muted-foreground"
          />
        </div>
      ))}
    </div>
  );
}
