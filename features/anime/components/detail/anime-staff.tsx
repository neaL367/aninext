import { UserIcon } from "lucide-react";

import { ImageWithLoading } from "@/components/image-with-loading";
import { Empty, EmptyHeader, EmptyTitle, EmptyMedia } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";

import type { StaffEdge } from "@/features/anime/types/anime";

export async function AnimeStaff({ edges }: { edges: StaffEdge[] }) {
  if (edges.length === 0)
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <UserIcon />
          </EmptyMedia>
          <EmptyTitle>No staff available</EmptyTitle>
        </EmptyHeader>
      </Empty>
    );

  return (
    <div className="divide-y divide-border-soft">
      {edges.map((edge, index) => (
        <div
          key={`${edge.node.id}-${index}`}
          className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
        >
          <div className="relative size-9 shrink-0 overflow-hidden rounded-full bg-surface-2">
            {edge.node.image.medium && (
              <ImageWithLoading
                src={edge.node.image.medium}
                alt={edge.node.name.full}
                fill
                sizes="36px"
                className="object-cover"
              />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{edge.node.name.full}</p>
            <p className="truncate font-mono text-[0.6rem] uppercase tracking-[0.08em] text-muted-foreground">
              {edge.role}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AnimeStaffSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-3 w-3/4 rounded" />
            <Skeleton className="h-2.5 w-1/2 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
