"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyHeader, EmptyTitle, EmptyMedia } from "@/components/ui/empty";
import { LinkIcon } from "lucide-react";
import { AnimePreviewCard } from "@/features/anime/components/anime-preview-card";
import type { RelationEdge } from "@/features/anime/types/anime";
import { getTitle, getCover } from "@/features/anime/lib/media-helpers";
import Link from "next/link";
import type { Route } from "next";
import { ImageWithLoading } from "@/components/image-with-loading";

export function AnimeRelations({
  edges: edgesProp,
}: {
  edges: RelationEdge[];
}) {
  if (edgesProp.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon"><LinkIcon /></EmptyMedia>
          <EmptyTitle>No related anime</EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div>
      <p className="mb-3 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted-foreground">{edgesProp.length} titles · scroll to browse</p>
      <div className="max-h-[360px] overflow-y-auto scrollbar-thin divide-y divide-border border-y border-border">
        {edgesProp.map((edge, i) => {
          const title = getTitle(edge.node.title);
          const cover = getCover(edge.node.coverImage);
          const color = edge.node.coverImage.color;
          return (
            <AnimePreviewCard key={`${edge.node.id}-${i}`} media={edge.node}>
              <Link href={`/anime/${edge.node.id}` as Route<string>} className="group flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="relative h-14 w-10 shrink-0 overflow-hidden border border-border bg-surface-2">
                  {cover ? (
                    <ImageWithLoading src={cover} alt={title} fill sizes="48px" className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center p-1" style={color ? { backgroundColor: `${color}35` } : undefined}>
                      <span className="line-clamp-3 text-center font-mono text-[0.5rem] uppercase text-muted-foreground">{title}</span>
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-medium leading-snug group-hover:text-accent">{title}</p>
                  <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.06em] text-muted-foreground">{edge.relationType.replaceAll("_", " ")}</p>
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
