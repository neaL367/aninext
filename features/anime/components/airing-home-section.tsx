"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

import { ViewAllLink } from "@/components/ui/view-all-link";
import {
  formatCountdown,
  fromAiringTimestamp,
  getAiringPhase,
  getTitle,
} from "@/features/anime/lib/media-helpers";

import { SectionHeader } from "./section-header";

import type { AiringScheduleNode } from "@/features/anime/types/anime";
import type { Route } from "next";

export function AiringHomeSection({ schedules }: { schedules: AiringScheduleNode[] }) {
  "use memo";
  const now = Date.now() / 1000;

  const upcomingSchedules = useMemo(
    () =>
      schedules
        .filter((s) => s.airingAt > now)
        .sort((a, b) => a.airingAt - b.airingAt)
        .slice(0, 6),
    [schedules, now],
  );

  if (upcomingSchedules.length === 0) return null;

  return (
    <section>
      <SectionHeader
        eyebrow="Today"
        title="Airing now"
        description="Catch the latest episodes as they land."
        action={<ViewAllLink href="/airing">Full schedule</ViewAllLink>}
      />
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {upcomingSchedules.map((item, index) => {
          if (!item.media) return null;
          const title = getTitle(item.media.title);
          const time = fromAiringTimestamp(item.airingAt);
          // eslint-disable-next-line react-hooks/purity -- live countdown, recomputed per render
          const phase = getAiringPhase(item.airingAt, now);
          const countdown = phase === "upcoming" ? formatCountdown(item.airingAt, now) : "";
          const isClose = phase === "upcoming" && item.airingAt - now < 3600;
          const color = item.media.coverImage.color;

          return (
            <Link
              key={`${item.media.id}-${index}`}
              href={`/anime/${item.media.id}` as Route<string>}
              className="group flex items-center gap-3 p-3 sm:gap-4 sm:p-4 border border-border transition-colors hover:border-accent/50 hover:bg-surface-1/50 overflow-hidden"
            >
              <div
                className="relative h-[72px] w-[54px] shrink-0 overflow-hidden bg-surface-2"
                style={color ? { backgroundColor: color } : undefined}
              >
                {item.media.coverImage.medium ? (
                  <Image
                    src={item.media.coverImage.medium}
                    alt={title}
                    fill
                    sizes="54px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-center font-mono text-[0.5rem] text-muted-foreground">
                    {title}
                  </div>
                )}
              </div>
              <div className="w-0 flex-1">
                <p className="line-clamp-1 text-sm font-medium group-hover:text-accent">{title}</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  Ep {item.episode} <span className="hidden sm:inline">· </span>
                  <span className="text-foreground">
                    {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className={`ml-1 ${isClose ? "text-live-badge" : "text-muted-foreground"}`}>
                    ({countdown})
                  </span>
                </p>
              </div>
              <div className="hidden shrink-0 text-right sm:block">
                <time
                  dateTime={time.toISOString()}
                  className="block font-mono text-sm tabular-nums text-foreground"
                >
                  {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </time>
                <span
                  className={`block mt-0.5 font-mono text-xs tabular-nums ${isClose ? "text-live-badge" : "text-muted-foreground"}`}
                >
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
          <div
            key={i}
            className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4 border border-border overflow-hidden bg-surface-1/30"
          >
            <div className="relative h-[72px] w-[54px] shrink-0 overflow-hidden bg-surface-2 isolate">
              <div className="absolute inset-0 shimmer" />
            </div>
            <div className="w-0 flex-1 space-y-2">
              <div className="shimmer h-4 w-3/4 rounded" />
              <div className="shimmer h-3 w-2/3 rounded" />
            </div>
            <div className="hidden shrink-0 space-y-1 sm:block">
              <div className="shimmer h-3 w-10 rounded" />
              <div className="shimmer h-2 w-8 rounded" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
