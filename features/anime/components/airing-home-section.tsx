import Link from "next/link";
import type { Route } from "next";
import { HoverPrefetchLink } from "@/components/hover-prefetch-link";
import { ArrowRightIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { AiringScheduleNode } from "@/features/anime/types/anime";
import { fromAiringTimestamp, getTitle } from "@/features/anime/lib/media-helpers";
import { ImageWithLoading } from "@/components/image-with-loading";

export function AiringHomeSection({ schedules }: { schedules: AiringScheduleNode[] }) {
  if (schedules.length === 0) return null;

  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-5">
        <div>
          <p className="eyebrow">Today</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">Airing now</h2>
          <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">Catch the latest episodes as they land.</p>
        </div>
        <HoverPrefetchLink href="/airing" className="group flex items-center gap-2 border-b border-border-soft pb-1 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground hover:border-accent hover:text-accent">
          Full schedule <ArrowRightIcon className="size-3 transition-transform group-hover:translate-x-1" />
        </HoverPrefetchLink>
      </div>
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {schedules.map((item, index) => {
          if (!item.media) return null;
          const title = getTitle(item.media.title);
          const time = fromAiringTimestamp(item.airingAt);
          const now = Date.now();
          const diff = item.airingAt * 1000 - now;
          const minutes = Math.floor(diff / 60000);
          const countdown = minutes > 60
            ? `${Math.floor(minutes / 60)}h ${minutes % 60}m`
            : minutes > 0
            ? `${minutes}m`
            : "Airing";
          const isClose = minutes > 0 && minutes < 60;

          return (
            <Link key={`${item.media.id}-${index}`} href={`/anime/${item.media.id}` as Route<string>} className="group flex items-center gap-3 p-3 sm:gap-4 sm:p-4 border border-border transition-colors hover:border-accent/50 hover:bg-surface-1/50">
              <div className="relative h-[72px] w-[54px] shrink-0 overflow-hidden bg-surface-2">
                {item.media.coverImage.medium ? (
                  <ImageWithLoading src={item.media.coverImage.medium} alt={title} fill sizes="54px" className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-center font-mono text-[0.5rem] text-muted-foreground">{title}</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium group-hover:text-accent">{title}</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  Ep {item.episode}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <time dateTime={time.toISOString()} className="block font-mono text-xs sm:text-sm tabular-nums text-foreground">
                  {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </time>
                <span className={`block mt-0.5 font-mono text-[0.6rem] sm:text-xs tabular-nums ${isClose ? "text-live-badge" : "text-muted-foreground"}`}>
                  {countdown}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function AiringHomeSectionSkeleton() {
  return (
    <section>
      <div className="mb-5 space-y-3">
        <div className="shimmer h-2.5 w-16 rounded" />
        <div className="shimmer h-8 w-56 rounded" />
      </div>
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4 border border-border">
            <div className="shimmer h-[72px] w-[54px]" />
            <div className="min-w-0 flex-1 space-y-1">
              <div className="shimmer h-4 w-3/4 rounded" />
              <div className="shimmer h-3 w-1/3 rounded" />
            </div>
            <div className="shrink-0 space-y-1">
              <div className="shimmer h-3 w-10 rounded" />
              <div className="shimmer h-2 w-8 rounded" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
