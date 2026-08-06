"use client";

import Image from "next/image";
import { ExternalLinkIcon, PlayIcon } from "lucide-react";
import { Empty, EmptyHeader, EmptyTitle, EmptyMedia } from "@/components/ui/empty";
import type { Media } from "@/features/anime/types/anime";

export function AnimeStreamingEpisodes({ media }: { media: Media }) {
  const episodes = media.streamingEpisodes;

  if (!episodes || episodes.length === 0) return <Empty><EmptyHeader><EmptyMedia variant="icon"><PlayIcon /></EmptyMedia><EmptyTitle>No streaming links indexed</EmptyTitle></EmptyHeader></Empty>;

  return (
    <div className="max-h-[420px] overflow-y-auto scrollbar-thin">
      <div className="divide-y divide-border">
        {episodes.map((ep, i) => (
          <a key={`${ep.url}-${i}`} href={ep.url} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 py-3 first:pt-0 last:pb-0">
            {ep.thumbnail ? (
              <div className="relative h-[54px] w-[96px] shrink-0 overflow-hidden bg-surface-2">
                <Image src={ep.thumbnail} alt="" fill sizes="96px" className="object-cover" />
              </div>
            ) : (
              <span className="flex size-[54px] shrink-0 items-center justify-center border border-border font-mono text-sm text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
            )}
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-medium group-hover:text-accent">{ep.title || `Episode ${i + 1}`}</p>
              {ep.site && <p className="mt-1 font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">{ep.site}</p>}
            </div>
            <ExternalLinkIcon className="size-4 shrink-0 text-muted-foreground group-hover:text-accent" />
          </a>
        ))}
      </div>
    </div>
  );
}

export function AnimeStreamingEpisodesSkeleton() {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3">
          <div className="shimmer h-[54px] w-[96px]" />
          <div className="flex-1 space-y-2">
            <div className="shimmer h-3 w-3/4 rounded" />
            <div className="shimmer h-2.5 w-1/3 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
