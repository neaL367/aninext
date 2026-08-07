import { UsersIcon } from "lucide-react";

import { Empty, EmptyHeader, EmptyTitle, EmptyMedia } from "@/components/ui/empty";
import { MediaImage } from "@/components/ui/media-image";

import type { CharacterEdge } from "@/features/anime/types/anime";

export function AnimeCharacters({ edges }: { edges: CharacterEdge[] }) {
  if (edges.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <UsersIcon />
          </EmptyMedia>
          <EmptyTitle>No characters available</EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
      {edges.map((edge, index) => {
        const voiceActor = edge.voiceActors?.[0];
        return (
          <article
            key={`${edge.node.id}-${index}`}
            className="group flex items-center gap-4 border border-border p-3 transition-colors hover:border-accent/40 hover:bg-surface-1/40"
          >
            <div className="relative h-[72px] w-[54px] shrink-0 overflow-hidden bg-surface-2">
              {edge.node.image.medium ? (
                <MediaImage
                  src={edge.node.image.medium}
                  alt={edge.node.name.full}
                  fill
                  sizes="54px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center p-1 text-center font-mono text-[0.5rem] uppercase text-muted-foreground">
                  {edge.node.name.full}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{edge.node.name.full}</p>
              <p className="mt-0.5 font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">
                {edge.role}
              </p>
            </div>
            {voiceActor && (
              <div className="flex shrink-0 items-center gap-2 border-l border-border pl-3">
                <div className="relative size-9 shrink-0 overflow-hidden rounded-full bg-surface-2">
                  {voiceActor.image.medium ? (
                    <MediaImage
                      src={voiceActor.image.medium}
                      alt={voiceActor.name.full}
                      fill
                      sizes="36px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex size-full items-center justify-center font-mono text-xs text-muted-foreground">
                      {voiceActor.name.full.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="min-w-0 max-w-[96px]">
                  <p className="truncate text-xs font-medium text-foreground">
                    {voiceActor.name.full}
                  </p>
                  <p className="truncate font-mono text-[0.55rem] uppercase tracking-[0.04em] text-muted-foreground">
                    VA
                  </p>
                </div>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

export function AnimeCharactersSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border border-border p-3">
          <div className="shimmer h-[72px] w-[54px]" />
          <div className="flex-1 space-y-2">
            <div className="shimmer h-4 w-3/4 rounded" />
            <div className="shimmer h-3 w-1/3 rounded" />
          </div>
          <div className="flex items-center gap-2 border-l border-border pl-3">
            <div className="shimmer size-9 rounded-full" />
            <div className="hidden sm:block sm:space-y-1">
              <div className="shimmer h-3 w-20 rounded" />
              <div className="shimmer h-2 w-8 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
