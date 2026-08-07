"use client";

import { CalendarIcon, ExternalLinkIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ImageWithLoading } from "@/components/ui/image-with-loading";
import { getAiringDayData } from "@/features/anime/anime-actions";
import { AnimePreviewCard } from "@/features/anime/components/anime-preview-card";
import {
  formatFormat,
  fromAiringTimestamp,
  getTitle,
  localDateStr,
} from "@/features/anime/lib/media-helpers";

import type { AiringScheduleNode } from "@/features/anime/types/anime";
import type { Route } from "next";

export function AiringTimeline({ day }: { day: string }) {
  const [state, setState] = useState<{ day: string; schedules: AiringScheduleNode[] } | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    const start = Math.floor(new Date(`${day}T00:00:00`).getTime() / 1000);
    const end = start + 86400;

    startTransition(async () => {
      try {
        const schedules = await getAiringDayData(day, start, end);
        if (!cancelled) setState({ day, schedules });
      } catch (err) {
        if (!cancelled) setError(err);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [day]);

  if (error) throw error;
  if (!state || state.day !== day) return <AiringTimelineSkeleton />;

  return <AiringTimelineList day={day} schedules={state.schedules} />;
}

function AiringTimelineList({ day, schedules }: { day: string; schedules: AiringScheduleNode[] }) {
  if (schedules.length === 0)
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CalendarIcon />
          </EmptyMedia>
          <EmptyTitle>Nothing airing today</EmptyTitle>
        </EmptyHeader>
        <EmptyContent>
          <EmptyDescription>Choose another day to scan the week.</EmptyDescription>
        </EmptyContent>
      </Empty>
    );

  const grouped = groupByTimeBlock(schedules);
  const now = Date.now() / 1000;
  const isToday = day === localDateStr();
  const activeBlock = isToday ? currentBlockName() : null;

  return (
    <div className="space-y-10">
      {Object.entries(grouped).map(([block, items]) => {
        const isActive = block === activeBlock;
        return (
          <section key={block}>
            <div className="mb-4 flex items-center gap-3">
              <span
                className={
                  isActive
                    ? "flex size-2 animate-pulse rounded-full bg-live-badge"
                    : "flex size-2 rounded-full bg-accent"
                }
              />
              <h2
                className={
                  isActive
                    ? "text-sm font-semibold uppercase tracking-[0.1em] text-live-badge"
                    : "text-sm font-semibold uppercase tracking-[0.1em] text-foreground"
                }
              >
                {block}
              </h2>
              {isActive && <span className="font-mono text-xs text-live-badge">now</span>}
              <span className="font-mono text-xs text-muted-foreground">{items.length}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item, index) => {
                if (!item.media) return null;
                const title = getTitle(item.media.title);
                const time = fromAiringTimestamp(item.airingAt);
                const diff = item.airingAt - now;
                const isClose = diff > 0 && diff < 3600;
                const isLive = diff <= 0 && diff > -1800;
                const color = item.media.coverImage.color;
                return (
                  <AnimePreviewCard key={`${item.media.id}-${index}`} media={item.media}>
                    <article className="group flex gap-4 border border-border p-4 transition-colors hover:border-accent/50 hover:bg-surface-1/40">
                      <Link
                        href={`/anime/${item.media.id}` as Route<string>}
                        className="relative h-[88px] w-[66px] shrink-0 overflow-hidden bg-surface-2"
                        style={color ? { backgroundColor: color } : undefined}
                      >
                        {item.media.coverImage.medium ? (
                          <ImageWithLoading
                            src={item.media.coverImage.medium}
                            alt={title}
                            fill
                            sizes="66px"
                            className="object-cover transition-transform duration-300 group-hover:scale-[1.05]"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center p-1 text-center font-mono text-[0.5rem] text-muted-foreground">
                            {title}
                          </div>
                        )}
                      </Link>
                      <div className="flex min-w-0 flex-1 flex-col justify-between">
                        <div>
                          <Link
                            href={`/anime/${item.media.id}` as Route<string>}
                            className="line-clamp-2 text-sm font-medium leading-snug hover:text-accent"
                          >
                            {title}
                          </Link>
                          <p className="mt-1 font-mono text-xs text-muted-foreground">
                            Ep {item.episode}{" "}
                            {item.media.format ? `· ${formatFormat(item.media.format)}` : ""}
                          </p>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {isLive ? (
                              <span className="flex items-center gap-1 font-mono text-xs text-live-badge">
                                <span className="size-1.5 animate-pulse rounded-full bg-live-badge" />
                                Live
                              </span>
                            ) : isClose ? (
                              <span className="flex items-center gap-1 font-mono text-xs text-live-badge">
                                Soon
                              </span>
                            ) : (
                              <time
                                dateTime={time.toISOString()}
                                className="font-mono text-xs tabular-nums text-muted-foreground"
                              >
                                {time.toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </time>
                            )}
                          </div>
                          {(() => {
                            const streamingLinks =
                              item.media?.externalLinks?.filter(
                                (link) => link.type === "STREAMING",
                              ) ?? [];
                            if (streamingLinks.length > 0) {
                              return (
                                <div className="flex shrink-0 items-center gap-1">
                                  {streamingLinks.slice(0, 3).map((link) => {
                                    const favicon = getFaviconUrl(link.url);
                                    return (
                                      <a
                                        key={link.url}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex size-5 items-center justify-center rounded-sm border border-border-soft bg-surface-1 transition-colors hover:border-accent hover:bg-accent/10"
                                        aria-label={`Watch on ${link.site}`}
                                        title={link.site}
                                      >
                                        {favicon ? (
                                          <Image
                                            src={favicon}
                                            alt=""
                                            width={14}
                                            height={14}
                                            className="size-3.5"
                                            unoptimized
                                          />
                                        ) : (
                                          <ExternalLinkIcon className="size-3 text-muted-foreground" />
                                        )}
                                      </a>
                                    );
                                  })}
                                </div>
                              );
                            }
                            return (
                              <Link
                                href={`/anime/${item.media.id}` as Route<string>}
                                className="shrink-0 text-muted-foreground hover:text-accent"
                                aria-label={`Open ${title}`}
                              >
                                <ExternalLinkIcon className="size-3.5" />
                              </Link>
                            );
                          })()}
                        </div>
                      </div>
                    </article>
                  </AnimePreviewCard>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function currentBlockName(): string {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return "Morning";
  if (hour >= 12 && hour < 18) return "Afternoon";
  if (hour >= 18 && hour < 24) return "Evening";
  return "Night";
}

function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return "";
  }
}

function groupByTimeBlock(schedules: AiringScheduleNode[]): Record<string, AiringScheduleNode[]> {
  const blocks: Record<string, AiringScheduleNode[]> = {
    Morning: [],
    Afternoon: [],
    Evening: [],
    Night: [],
  };
  for (const item of schedules) {
    const hour = fromAiringTimestamp(item.airingAt).getHours();
    if (hour >= 6 && hour < 12) blocks["Morning"].push(item);
    else if (hour >= 12 && hour < 18) blocks["Afternoon"].push(item);
    else if (hour >= 18 && hour < 24) blocks["Evening"].push(item);
    else blocks["Night"].push(item);
  }
  return Object.fromEntries(Object.entries(blocks).filter(([, items]) => items.length > 0));
}

export function AiringTimelineSkeleton() {
  return (
    <div className="space-y-10">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i}>
          <div className="mb-4 flex items-center gap-3">
            <div className="shimmer size-2 rounded-full" />
            <div className="shimmer h-4 w-24 rounded" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((__, j) => (
              <div key={j} className="flex gap-4 border border-border p-4">
                <div className="shimmer h-[88px] w-[66px]" />
                <div className="flex flex-1 flex-col justify-between">
                  <div className="space-y-2">
                    <div className="shimmer h-4 w-3/4 rounded" />
                    <div className="shimmer h-3 w-1/2 rounded" />
                  </div>
                  <div className="shimmer h-3 w-12 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
