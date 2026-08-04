import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyHeader, EmptyTitle, EmptyMedia } from "@/components/ui/empty";
import { MessageSquareIcon } from "lucide-react";
import type { ReviewNode } from "@/features/anime/types/anime";
import { getAnimeReviews } from "@/features/anime/anime-queries";
import { scoreColor } from "@/features/anime/lib/score";
import { cn } from "@/lib/utils";

export async function AnimeReviews({
  id,
  nodes: nodesProp,
}: {
  id?: number;
  nodes?: ReviewNode[];
}) {
  const nodes = nodesProp !== undefined ? nodesProp : await getAnimeReviews(id!);

  if (nodes.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MessageSquareIcon />
          </EmptyMedia>
          <EmptyTitle>No reviews yet</EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Reviews</h2>
      <div className="flex flex-col gap-3">
        {nodes.map((node) => (
          <div key={node.id} className="rounded-xl border border-border-soft bg-surface-2/30 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                {node.user.name[0]?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{node.user.name}</p>
              </div>
              <span className={cn("font-mono text-sm font-bold tabular-nums", scoreColor(node.score))}>
                {node.score}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{node.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnimeReviewsSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="h-7 w-24 rounded-md shimmer" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border-soft bg-surface-2/30 p-4">
            <div className="flex items-center gap-3 mb-3">
              <Skeleton className="size-8 shrink-0 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24 rounded" />
              </div>
              <Skeleton className="h-5 w-8 rounded" />
            </div>
            <Skeleton className="h-16 w-full rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
