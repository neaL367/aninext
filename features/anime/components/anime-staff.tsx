import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyHeader, EmptyTitle, EmptyMedia } from "@/components/ui/empty";
import { UserIcon } from "lucide-react";
import type { StaffEdge } from "@/features/anime/types/anime";
import { getAnimeStaff } from "@/features/anime/anime-queries";

export async function AnimeStaff({
  id,
  edges: edgesProp,
}: {
  id?: number;
  edges?: StaffEdge[];
}) {
  const edges = edgesProp !== undefined ? edgesProp : await getAnimeStaff(id!);

  if (edges.length === 0) {
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
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Staff</h2>
      <div className="flex flex-col gap-2">
        {edges.map((edge, i) => (
          <div key={`${edge.node.id}-${i}`} className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-surface-2/50">
            <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-muted">
              {edge.node.image.medium && (
                <Image
                  src={edge.node.image.medium}
                  alt={edge.node.name.full}
                  fill
                  sizes="40px"
                  className="object-cover"
                  loading="lazy"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{edge.node.name.full}</p>
              <p className="truncate text-xs text-muted-foreground">{edge.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnimeStaffSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="h-7 w-20 rounded-md shimmer" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg p-2">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="flex-1 flex flex-col gap-1">
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-3 w-1/2 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
