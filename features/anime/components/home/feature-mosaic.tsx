import { ArrowUpRightIcon } from "lucide-react";

import { HoverPrefetchLink } from "@/components/hover-prefetch-link";
import { AnimePreviewCard } from "@/features/anime/components/anime-preview-card";

import { MediaCard, MediaCardSkeleton } from "./media-card";

import type { Media } from "@/features/anime/types/anime";
import type { Route } from "next";

export function FeatureMosaic({
  title,
  href,
  items,
}: {
  title: string;
  href: Route<string>;
  items: Media[];
}) {
  if (items.length === 0) return null;
  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-5">
        <div>
          <p className="eyebrow">Seasonal radar</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">{title}</h2>
        </div>
        <HoverPrefetchLink
          href={href}
          className="group flex items-center gap-2 border-b border-border-soft pb-1 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground hover:border-accent hover:text-accent"
        >
          View all{" "}
          <ArrowUpRightIcon className="size-3 transition-transform group-hover:translate-x-0.5" />
        </HoverPrefetchLink>
      </div>
      <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
        {items.slice(0, 5).map((item, i) => (
          <div key={item.id}>
            <AnimePreviewCard media={item}>
              <MediaCard media={item} priority={i === 0} coverTier="extraLarge" />
            </AnimePreviewCard>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FeatureMosaicSkeleton() {
  return (
    <section>
      <div className="mb-5 space-y-3">
        <div className="shimmer h-2.5 w-24 rounded" />
        <div className="shimmer h-8 w-56 rounded" />
      </div>
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <MediaCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}
