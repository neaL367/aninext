"use client";

import type { AiringScheduleNode } from "@/features/anime/types/anime";
import { fromAiringTimestamp } from "@/features/anime/lib/media-helpers";

export function AnimeAiringScheduleClient({
  nodes,
}: {
  nodes: AiringScheduleNode[];
}) {
  if (nodes.length === 0) {
    return null;
  }

  return (
    <div>
      <p className="mb-3 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted-foreground">{nodes.length} episodes · scroll</p>
      <div className="max-h-[260px] overflow-y-auto scrollbar-thin divide-y divide-border border-y border-border">
        {nodes.map((node) => {
          const date = fromAiringTimestamp(node.airingAt);
          return (
            <div key={node.episode} className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
              <span className="flex items-center gap-2 text-sm font-medium">
                <span className="size-1.5 rounded-full bg-live-badge" />Ep {node.episode}
              </span>
              <time dateTime={date.toISOString()} className="font-mono text-xs tabular-nums text-muted-foreground">
                {date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
              </time>
            </div>
          );
        })}
      </div>
    </div>
  );
}
