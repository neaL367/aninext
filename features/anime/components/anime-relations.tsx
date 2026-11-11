import { LinkIcon } from "lucide-react";
import Link from "next/link";

import { MediaImage } from "@/components/ui/media-image";
import { Skeleton } from "@/components/ui/skeleton";
import { getTitle, getCover } from "@/features/anime/lib/media-helpers";

import { EmptyState } from "./empty-state";

import type { RelationEdge } from "@/features/anime/types/anime";
import type { Route } from "next";

export function AnimeRelations({ edges }: { edges: RelationEdge[] }) {
  "use memo";
  if (edges.length === 0) {
    return <EmptyState icon={LinkIcon} title="No related titles" />;
  }

  return (
    <div
      tabIndex={0}
      role="list"
      aria-label="Related anime"
      className="max-h-[360px] divide-y divide-border-soft overflow-y-auto border-t border-border-soft scrollbar-thin focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
    >
      {edges.map((edge, i) => {
        const title = getTitle(edge.node.title);
        // 32px box: medium is the right source, not the 230px "large".
        const cover = getCover(edge.node.coverImage, "medium");
        const color = edge.node.coverImage.color;
        return (
          <Link
            key={`${edge.node.id}-${i}`}
            href={`/anime/${edge.node.id}` as Route<string>}
            role="listitem"
            className="group flex items-center gap-3 py-2.5"
          >
            <div
              className="relative h-12 w-8 shrink-0 overflow-hidden rounded-[2px] bg-surface-2"
              style={color ? { backgroundColor: color } : undefined}
            >
              {cover ? (
                <MediaImage
                  src={cover}
                  alt={title}
                  fill
                  sizes="32px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none"
                />
              ) : (
                <div
                  className="flex h-full items-center justify-center p-1"
                  style={color ? { backgroundColor: `${color}35` } : undefined}
                >
                  <span className="line-clamp-3 text-center font-mono text-[0.5rem] uppercase text-muted-foreground">
                    {title}
                  </span>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 font-serif text-sm leading-snug text-foreground transition-colors group-hover:text-signal">
                {title}
              </p>
              <p className="mt-0.5 font-mono text-[0.55rem] uppercase tracking-[0.1em] text-muted-foreground/70">
                {edge.relationType.replaceAll("_", " ")}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export function AnimeRelationsSkeleton() {
  return (
    <div className="divide-y divide-border-soft border-t border-border-soft">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-2.5">
          <Skeleton className="h-12 w-8 shrink-0 rounded-[2px]" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-3/4 rounded-[2px]" />
            <Skeleton className="h-2.5 w-16 rounded-[2px]" />
          </div>
        </div>
      ))}
    </div>
  );
}
