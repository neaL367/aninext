import { UserIcon } from "lucide-react";

import { MediaImage } from "@/components/ui/media-image";
import { Skeleton } from "@/components/ui/skeleton";

import { EmptyState } from "./empty-state";

import type { StaffEdge } from "@/features/anime/types/anime";

export function AnimeStaff({ edges }: { edges: StaffEdge[] }) {
  "use memo";
  if (edges.length === 0) return <EmptyState icon={UserIcon} title="No staff" />;

  return (
    <div className="divide-y divide-border-soft border-t border-border-soft">
      {edges.map((edge, index) => (
        <div key={`${edge.node.id}-${index}`} className="flex items-center gap-3 py-2.5">
          <div className="relative size-8 shrink-0 overflow-hidden rounded-full bg-surface-2">
            {edge.node.image.medium ? (
              <MediaImage
                src={edge.node.image.medium}
                alt={edge.node.name.full}
                fill
                sizes="32px"
                className="object-cover"
              />
            ) : (
              <span className="flex size-full items-center justify-center font-mono text-[0.6rem] text-muted-foreground">
                {edge.node.name.full.charAt(0)}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-serif text-sm leading-snug text-foreground">
              {edge.node.name.full}
            </p>
            <p className="truncate font-mono text-[0.55rem] uppercase tracking-[0.12em] text-muted-foreground/70">
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
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-3/4 rounded-[2px]" />
            <Skeleton className="h-2.5 w-1/2 rounded-[2px]" />
          </div>
        </div>
      ))}
    </div>
  );
}
