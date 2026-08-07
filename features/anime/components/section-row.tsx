import { ArrowRightIcon } from "lucide-react";

import { HoverPrefetchLink } from "@/components/ui/hover-prefetch-link";
import { AnimePreviewCard } from "@/features/anime/components/anime-preview-card";

import { MediaCard, MediaCardSkeleton } from "./media-card";
import { SectionHeader } from "./section-header";

import type { Media } from "@/features/anime/types/anime";
import type { Route } from "next";

export function SectionRow({
  title,
  href,
  items,
  description,
  showRank,
}: {
  title: string;
  href: Route<string>;
  items: Media[];
  description?: string;
  showRank?: boolean;
}) {
  return (
    <section>
      <SectionHeader
        eyebrow={showRank ? "Ranked selection" : "Featured selection"}
        title={title}
        count={`/${String(items.length).padStart(2, "0")}`}
        description={description}
        action={
          <HoverPrefetchLink
            href={href}
            className="group flex shrink-0 items-center gap-2 border-b border-border-soft pb-1 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:border-signal hover:text-signal"
          >
            View all{" "}
            <ArrowRightIcon className="size-3 transition-transform group-hover:translate-x-1" />
          </HoverPrefetchLink>
        }
      />
      <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-3 scrollbar-none md:grid md:grid-cols-5 md:gap-x-5 md:gap-y-8 md:overflow-visible lg:grid-cols-6 xl:grid-cols-7">
        {items.map((item, i) => (
          <div key={item.id} className="w-[148px] shrink-0 snap-start sm:w-[164px] md:w-auto">
            <AnimePreviewCard media={item}>
              <MediaCard media={item} rank={showRank ? i + 1 : undefined} />
            </AnimePreviewCard>
          </div>
        ))}
      </div>
    </section>
  );
}

export function SectionRowSkeleton({ count = 6 }: { count?: number }) {
  return (
    <section>
      <div className="mb-5 space-y-3">
        <div className="shimmer h-2.5 w-24 rounded" />
        <div className="shimmer h-8 w-48 rounded" />
      </div>
      <div className="flex gap-5 overflow-hidden md:grid md:grid-cols-6">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="w-[148px] shrink-0 md:w-auto">
            <MediaCardSkeleton />
          </div>
        ))}
      </div>
    </section>
  );
}
