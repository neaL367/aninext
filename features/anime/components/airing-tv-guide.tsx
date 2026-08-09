"use client";

import { CalendarIcon, ExternalLinkIcon, FilmIcon, TvIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

import { LocalTime } from "@/components/ui/local-time";
import { MediaImage } from "@/components/ui/media-image";
import {
  formatCountdown,
  formatFormat,
  getFaviconUrl,
  getStreamingLinks,
  getTitle,
  localDateStr,
} from "@/features/anime/lib/media-helpers";
import { cn } from "@/lib/utils";

import { useNow } from "../hooks/use-now";
import { FILTER_ADULT_GENRES } from "../lib/filter-constants";
import { EmptyState } from "./empty-state";

import type { AiringScheduleNode } from "@/features/anime/types/anime";
import type { Route } from "next";

function isAdultContent(media: AiringScheduleNode["media"]): boolean {
  if (!media) return false;
  return (
    media.genres?.some((genre) =>
      FILTER_ADULT_GENRES.includes(genre as (typeof FILTER_ADULT_GENRES)[number]),
    ) ?? false
  );
}

function getPhase(airingAt: number, now: number): "aired" | "live" | "upcoming" {
  if (airingAt > now) return "upcoming";
  if (airingAt > now - 1800) return "live";
  return "aired";
}

export function AiringTVGuide({
  day,
  schedules,
}: {
  day: string;
  schedules: AiringScheduleNode[];
}) {
  "use memo";
  const now = useNow();
  const isToday = day === localDateStr();

  const visibleSchedules = useMemo(
    () => schedules.filter((s) => s.media && !isAdultContent(s.media)),
    [schedules],
  );

  const grouped = useMemo(() => {
    const groups: Record<string, AiringScheduleNode[]> = {};
    for (const item of visibleSchedules) {
      const format = item.media?.format || "Other";
      if (!groups[format]) groups[format] = [];
      groups[format].push(item);
    }
    return groups;
  }, [visibleSchedules]);

  const sortedFormats = useMemo(() => {
    const order = ["TV", "TV_SHORT", "MOVIE", "OVA", "ONA", "SPECIAL", "MUSIC"];
    return order.filter((f) => grouped[f]?.length);
  }, [grouped]);

  if (visibleSchedules.length === 0) {
    return (
      <EmptyState
        icon={CalendarIcon}
        title="Nothing airing today"
        description="Choose another day to scan the week."
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Format sections */}
      {sortedFormats.map((format) => {
        const items = grouped[format];
        return (
          <FormatSection key={format} format={format} items={items} now={now} isToday={isToday} />
        );
      })}
    </div>
  );
}

function FormatSection({
  format,
  items,
  now,
  isToday,
}: {
  format: string;
  items: AiringScheduleNode[];
  now: number;
  isToday: boolean;
}) {
  "use memo";
  const Icon = format === "MOVIE" ? FilmIcon : TvIcon;
  const liveCount = isToday ? items.filter((s) => getPhase(s.airingAt, now) === "live").length : 0;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <Icon className="size-5 text-signal" />
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {formatFormat(format)}
        </h2>
        <span className="rounded-full bg-surface-2 px-2 py-0.5 font-mono text-xs text-muted-foreground">
          {items.length}
        </span>
        {liveCount > 0 && (
          <span className="flex items-center gap-1.5 rounded-full bg-destructive/10 px-2 py-0.5 font-mono text-xs font-medium text-destructive">
            <span className="size-1.5 animate-pulse rounded-full bg-destructive" />
            {liveCount} live
          </span>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <AiringCard key={`${item.media!.id}-${index}`} item={item} now={now} />
        ))}
      </div>
    </section>
  );
}

function AiringCard({ item, now }: { item: AiringScheduleNode; now: number }) {
  "use memo";
  const media = item.media!;
  const title = getTitle(media.title);
  const phase = getPhase(item.airingAt, now);
  const isClose = phase === "upcoming" && item.airingAt - now < 3600;
  const countdown = phase === "upcoming" ? formatCountdown(item.airingAt, now) : "";
  const color = media.coverImage.color;
  const streamingLinks = getStreamingLinks(media.externalLinks);

  return (
    <Link
      href={`/anime/${media.id}` as Route<string>}
      className={cn(
        "group relative flex gap-4 rounded-xl border border-border-soft bg-surface-1/40 p-3 transition-all hover:border-signal/50 hover:bg-surface-1",
        phase === "aired" && "opacity-70",
      )}
    >
      {/* Cover */}
      <div
        className="relative h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-2"
        style={color ? { backgroundColor: color } : undefined}
      >
        {media.coverImage.medium ? (
          <MediaImage
            src={media.coverImage.medium}
            alt={title}
            fill
            sizes="56px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-1 text-center font-mono text-[0.5rem] text-muted-foreground">
            {title}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground group-hover:text-signal transition-colors">
          {title}
        </p>
        <div className="mt-1 flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <span>Ep {item.episode}</span>
          {media.format && <span>· {formatFormat(media.format)}</span>}
        </div>
        <div className="mt-2 flex items-center gap-2">
          {phase === "live" && (
            <span className="flex items-center gap-1 font-mono text-xs font-bold text-destructive">
              <span className="size-1.5 animate-pulse rounded-full bg-destructive" />
              Live
            </span>
          )}
          {phase === "aired" && (
            <span className="font-mono text-xs text-muted-foreground">Aired</span>
          )}
          {phase === "upcoming" && isClose && (
            <span className="font-mono text-xs font-bold text-destructive">{countdown}</span>
          )}
          <LocalTime
            timestamp={item.airingAt}
            className={cn(
              "font-mono text-xs tabular-nums",
              phase === "aired" ? "text-muted-foreground/50" : "text-muted-foreground",
            )}
          />
        </div>
        {streamingLinks.length > 0 && (
          <div className="mt-2 flex items-center gap-1">
            {streamingLinks.slice(0, 3).map((link) => {
              const favicon = getFaviconUrl(link.url);
              return (
                <span
                  key={link.url}
                  className="flex size-5 items-center justify-center rounded border border-border-soft bg-surface-1"
                  title={link.site}
                >
                  {favicon ? (
                    <Image
                      src={favicon}
                      alt=""
                      width={12}
                      height={12}
                      className="size-3"
                      unoptimized
                    />
                  ) : (
                    <ExternalLinkIcon className="size-2.5 text-muted-foreground" />
                  )}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </Link>
  );
}

export function AiringTVGuideSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 rounded-lg border border-signal/30 bg-signal/5 px-4 py-3">
        <div className="shimmer size-4 rounded" />
        <div className="shimmer h-4 w-40 rounded" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="shimmer size-5 rounded" />
            <div className="shimmer h-5 w-20 rounded" />
            <div className="shimmer h-5 w-8 rounded-full" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((__, j) => (
              <div
                key={j}
                className="flex gap-4 rounded-xl border border-border-soft bg-surface-1/40 p-3"
              >
                <div className="shimmer h-20 w-14 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="shimmer h-3 w-full rounded" />
                  <div className="shimmer h-3 w-2/3 rounded" />
                  <div className="shimmer h-2.5 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
