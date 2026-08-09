import { LinkIcon } from "lucide-react";
import Link from "next/link";

import { MediaImage } from "@/components/ui/media-image";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimePreviewCard } from "@/features/anime/components/anime-preview-card";
import { getTitle, getCover } from "@/features/anime/lib/media-helpers";

import { EmptyState } from "./empty-state";

import type { RelationEdge } from "@/features/anime/types/anime";
import type { Route } from "next";

export function AnimeRelations({ edges }: { edges: RelationEdge[] }) {
  "use memo";
  if (edges.length === 0) {
    return (
      <EmptyState icon={LinkIcon} title="No related anime" description="No related anime found." />
    );
  }

  return (
    <div>
      <p className="mb-3 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted-foreground">
        {edges.length} titles · scroll to browse
      </p>
      <div
        tabIndex={0}
        role="list"
        aria-label="Related anime"
        className="max-h-[360px] overflow-y-auto scrollbar-thin divide-y divide-border-soft border-y border-border-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
      >
        {edges.map((edge, i) => {
          const title = getTitle(edge.node.title);
          const cover = getCover(edge.node.coverImage);
          const color = edge.node.coverImage.color;
          return (
            <AnimePreviewCard key={`${edge.node.id}-${i}`} media={edge.node}>
              <Link
                href={`/anime/${edge.node.id}` as Route<string>}
                role="listitem"
                className="group flex items-center gap-3 py-3 transition-colors hover:bg-surface-1/50 px-2 rounded-md"
              >
                <div
                  className="relative h-14 w-10 shrink-0 overflow-hidden rounded border border-border-soft bg-surface-2"
                  style={color ? { backgroundColor: color } : undefined}
                >
                  {cover ? (
                    <MediaImage
                      src={cover}
                      alt={title}
                      fill
                      sizes="48px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105 transform-gpu"
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
                  <p className="line-clamp-2 text-xs font-semibold leading-snug text-foreground group-hover:text-signal transition-colors">
                    {title}
                  </p>
                  <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.06em] text-muted-foreground">
                    {edge.relationType.replaceAll("_", " ")}
                  </p>
                </div>
              </Link>
            </AnimePreviewCard>
          );
        })}
      </div>
    </div>
  );
}

export function AnimeRelationsSkeleton() {
  return (
    <div>
      <div className="shimmer mb-3 h-3 w-24 rounded" />
      <div className="divide-y divide-border border-y border-border">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-3">
            <Skeleton className="h-14 w-10 shrink-0 rounded-none" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-3/4 rounded" />
              <Skeleton className="h-2.5 w-20 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
