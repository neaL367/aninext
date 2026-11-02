"use client";

import Link from "next/link";
import { useMemo } from "react";

import { LocalTime } from "@/components/ui/local-time";
import { ViewAllLink } from "@/components/ui/view-all-link";
import { MediaImage } from "@/components/ui/media-image";
import { formatCountdown, getAiringPhase, getTitle } from "@/features/anime/lib/media-helpers";
import { cn } from "@/lib/utils";

import { SectionHeader } from "./section-header";

import type { AiringScheduleNode } from "@/features/anime/types/anime";
import type { Route } from "next";

export function AiringHomeSection({ schedules }: { schedules: AiringScheduleNode[] }) {
  "use memo";
  const now = Date.now() / 1000;

  const upcoming = useMemo(
    () =>
      schedules
        .filter((schedule) => schedule.airingAt > now)
        .sort((a, b) => a.airingAt - b.airingAt)
        .slice(0, 5),
    [schedules, now],
  );

  if (upcoming.length === 0) return null;

  return (
    <section aria-labelledby="tonight">
      <SectionHeader
        index="03"
        title="Tonight"
        action={<ViewAllLink href="/airing">Full schedule</ViewAllLink>}
      />
      <ol className="divide-y divide-border-soft border-t border-border-soft">
        {upcoming.map((item) => {
          if (!item.media) return null;
          const title = getTitle(item.media.title);
          const phase = getAiringPhase(item.airingAt, now);
          const countdown = phase === "upcoming" ? formatCountdown(item.airingAt, now) : "";
          const isSoon = phase === "upcoming" && item.airingAt - now < 3600;

          return (
            <li key={`${item.media.id}-${item.episode}`}>
              <Link
                href={`/anime/${item.media.id}` as Route<string>}
                className="group flex items-center gap-4 py-3.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
              >
                <span className="w-14 shrink-0 font-mono text-sm tabular-nums text-foreground/80">
                  <LocalTime timestamp={item.airingAt} />
                </span>
                <span className="relative aspect-[2/3] w-8 shrink-0 overflow-hidden rounded-[2px] bg-surface-2">
                  {item.media.coverImage.medium && (
                    <MediaImage
                      src={item.media.coverImage.medium}
                      alt=""
                      fill
                      sizes="32px"
                      loading="lazy"
                      className="object-cover"
                    />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-serif text-base leading-snug text-foreground transition-colors group-hover:text-signal sm:text-lg">
                    {title}
                  </span>
                  <span className="mt-0.5 block font-mono text-[0.56rem] uppercase tracking-[0.12em] text-muted-foreground/75">
                    Episode {item.episode}
                  </span>
                </span>
                <span
                  className={cn(
                    "shrink-0 font-mono text-[0.62rem] tabular-nums",
                    isSoon ? "text-signal" : "text-muted-foreground",
                  )}
                >
                  {isSoon ? `in ${countdown}` : countdown}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function AiringHomeSectionSkeleton() {
  return (
    <section>
      <div className="mb-8 border-b border-border-soft pb-4">
        <div className="shimmer h-9 w-40 rounded-[2px]" />
      </div>
      <div className="divide-y divide-border-soft border-t border-border-soft">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3.5">
            <div className="shimmer h-4 w-12 rounded-[2px]" />
            <div className="shimmer h-10 w-8 rounded-[2px]" />
            <div className="flex-1 space-y-2">
              <div className="shimmer h-4 w-3/5 rounded-[2px]" />
              <div className="shimmer h-2.5 w-20 rounded-[2px]" />
            </div>
            <div className="shimmer h-3 w-10 rounded-[2px]" />
          </div>
        ))}
      </div>
    </section>
  );
}
