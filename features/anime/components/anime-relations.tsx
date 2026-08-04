import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyHeader, EmptyTitle, EmptyMedia } from "@/components/ui/empty";
import { LinkIcon } from "lucide-react";
import { getAnimeRelations } from "@/features/anime/anime-queries";
import { AnimePreviewCard } from "./anime-preview-card";
import type { RelationEdge } from "@/features/anime/types/anime";
import { getTitle, getCover } from "@/features/anime/lib/media-helpers";
import Link from "next/link";
import type { Route } from "next";

export async function AnimeRelations({
  id,
  edges: edgesProp,
}: {
  id?: number;
  edges?: RelationEdge[];
}) {
  const edges = edgesProp !== undefined ? edgesProp : await getAnimeRelations(id!);

  if (edges.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <LinkIcon />
          </EmptyMedia>
          <EmptyTitle>No related anime</EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Related</h2>
      <div className="flex flex-col gap-2">
        {edges.map((edge, i) => {
          const title = getTitle(edge.node.title);
          const cover = getCover(edge.node.coverImage);
          return (
            <AnimePreviewCard key={`${edge.node.id}-${i}`} media={edge.node}>
              <Link href={`/anime/${edge.node.id}` as Route<string>} className="group block">
                <div className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-surface-2/50">
                  {cover && (
                    <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                      <Image
                        src={cover}
                        alt={title}
                        fill
                        sizes="48px"
                        className="object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <p className="line-clamp-1 text-sm font-medium">{title}</p>
                    <Badge variant="outline" className="w-fit rounded-full border-border/60 bg-transparent text-[10px]">
                      {edge.relationType.replace("_", " ")}
                    </Badge>
                  </div>
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
    <div className="flex flex-col gap-5">
      <div className="h-7 w-24 rounded-md shimmer" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg p-2">
            <Skeleton className="h-16 w-12 shrink-0 rounded-md" />
            <div className="flex-1 flex flex-col gap-2">
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
