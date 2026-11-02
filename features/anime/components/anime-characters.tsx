import { UsersIcon } from "lucide-react";

import { MediaImage } from "@/components/ui/media-image";

import { EmptyState } from "./empty-state";

import type { CharacterEdge } from "@/features/anime/types/anime";

export function AnimeCharacters({ edges }: { edges: CharacterEdge[] }) {
  "use memo";
  if (edges.length === 0) {
    return <EmptyState icon={UsersIcon} title="No characters" />;
  }

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-0 sm:grid-cols-2">
      {edges.map((edge, index) => {
        const voiceActor = edge.voiceActors?.[0];
        return (
          <article
            key={`${edge.node.id}-${index}`}
            className="group flex items-center gap-4 border-b border-border-soft py-2.5 first:pt-0"
          >
            <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-[2px] bg-surface-2">
              {edge.node.image.medium ? (
                <MediaImage
                  src={edge.node.image.medium}
                  alt={edge.node.name.full}
                  fill
                  sizes="48px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
                />
              ) : (
                <div className="flex h-full items-center justify-center p-1 text-center font-mono text-[0.5rem] uppercase text-muted-foreground">
                  {edge.node.name.full}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-serif text-sm leading-snug text-foreground">
                {edge.node.name.full}
              </p>
              <p className="mt-0.5 truncate font-mono text-[0.55rem] uppercase tracking-[0.12em] text-muted-foreground/70">
                {edge.role}
              </p>
            </div>
            {voiceActor && (
              <div className="flex shrink-0 items-center gap-2">
                <div className="relative size-7 shrink-0 overflow-hidden rounded-full bg-surface-2">
                  {voiceActor.image.medium ? (
                    <MediaImage
                      src={voiceActor.image.medium}
                      alt={voiceActor.name.full}
                      fill
                      sizes="28px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex size-full items-center justify-center font-mono text-[0.55rem] text-muted-foreground">
                      {voiceActor.name.full.charAt(0)}
                    </span>
                  )}
                </div>
                <p className="hidden max-w-[88px] truncate font-mono text-[0.55rem] text-muted-foreground/80 sm:block">
                  {voiceActor.name.full}
                </p>
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
    <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-border-soft py-2.5">
          <div className="shimmer h-16 w-12 shrink-0 rounded-[2px]" />
          <div className="flex-1 space-y-2">
            <div className="shimmer h-3.5 w-3/4 rounded-[2px]" />
            <div className="shimmer h-2.5 w-1/3 rounded-[2px]" />
          </div>
        </div>
      ))}
    </div>
  );
}
