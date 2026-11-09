"use client";

import { CalendarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { LocalTime } from "@/components/ui/local-time";
import { MediaImage } from "@/components/ui/media-image";
import { Skeleton } from "@/components/ui/skeleton";
import { isValidAiringOffset, type AiringContext } from "@/features/anime/lib/airing";
import {
  formatCountdown,
  formatFormat,
  getFaviconUrl,
  getLocalOffsetMinutes,
  getOffsetHour,
  getOffsetTodayStr,
  getStreamingLinks,
  getTimezoneLabel,
  getTitle,
} from "@/features/anime/lib/media-helpers";
import { cn } from "@/lib/utils";

import { useNow } from "../hooks/use-now";
import { FILTER_ADULT_GENRES } from "../lib/filter-constants";
import { EmptyState } from "./empty-state";

import type { AiringScheduleNode } from "@/features/anime/types/anime";
import type { Route } from "next";

const FORMAT_FILTERS = ["ALL", "TV", "TV_SHORT", "MOVIE", "OVA", "ONA", "SPECIAL"] as const;

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

function formatAgo(airingAt: number, now: number): string {
  const mins = Math.floor((now - airingAt) / 60);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function formatDayLabel(day: string): string {
  const date = new Date(day + "T00:00:00");
  if (!Number.isFinite(date.getTime())) return day;
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatFilterLabel(filter: (typeof FORMAT_FILTERS)[number]): string {
  if (filter === "ALL") return "All";
  return formatFormat(filter);
}

interface Band {
  hour: number;
  items: AiringScheduleNode[];
}

export function AiringTimeline({
  day,
  schedules,
  context,
}: {
  day: string;
  schedules: AiringScheduleNode[];
  context: AiringContext;
}) {
  "use memo";
  const now = useNow();
  const [browserOffset, setBrowserOffset] = useState(0);

  useEffect(() => {
    if (context.offsetMinutes === undefined) setBrowserOffset(getLocalOffsetMinutes());
  }, [context.offsetMinutes]);

  const offset = useMemo(
    () =>
      typeof context.offsetMinutes === "number" && isValidAiringOffset(context.offsetMinutes)
        ? context.offsetMinutes
        : browserOffset,
    [browserOffset, context.offsetMinutes],
  );
  const isToday = useMemo(() => day === getOffsetTodayStr(offset), [day, offset]);
  const timezone = useMemo(() => getTimezoneLabel(offset), [offset]);
  const [formatFilter, setFormatFilter] = useState<(typeof FORMAT_FILTERS)[number]>("ALL");
  const didAutoScroll = useRef(false);

  const visible = useMemo(
    () => schedules.filter((schedule) => schedule.media && !isAdultContent(schedule.media)),
    [schedules],
  );
  const filtered = useMemo(
    () =>
      formatFilter === "ALL"
        ? visible
        : visible.filter((schedule) => schedule.media?.format === formatFilter),
    [visible, formatFilter],
  );
  const sorted = useMemo(() => [...filtered].sort((a, b) => a.airingAt - b.airingAt), [filtered]);

  const bands = useMemo<Band[]>(() => {
    const map = new Map<number, AiringScheduleNode[]>();
    for (const schedule of sorted) {
      const hour = getOffsetHour(schedule.airingAt, offset);
      const list = map.get(hour) ?? [];
      list.push(schedule);
      map.set(hour, list);
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]).map(([hour, items]) => ({ hour, items }));
  }, [sorted, offset]);

  const liveCount = useMemo(
    () => sorted.filter((schedule) => getPhase(schedule.airingAt, now) === "live").length,
    [sorted, now],
  );

  useEffect(() => {
    if (!isToday || didAutoScroll.current || bands.length === 0) return;
    const firstUpcomingBand = bands.find((band) =>
      band.items.some((schedule) => getPhase(schedule.airingAt, now) === "upcoming"),
    );
    const element = firstUpcomingBand
      ? document.getElementById(`band-${firstUpcomingBand.hour}`)
      : document.getElementById("now-indicator");
    if (element && element.getBoundingClientRect().top > window.innerHeight * 0.82) {
      didAutoScroll.current = true;
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [isToday, bands, now]);

  if (visible.length === 0) {
    return <EmptyState icon={CalendarIcon} title="Nothing airing this day" />;
  }

  return (
    <section className="space-y-6" aria-label="Day lineup">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border-soft pb-4">
        <div>
          <h2 className="display text-3xl sm:text-4xl">
            {isToday ? "Today" : formatDayLabel(day)}
          </h2>
          <p className="mt-1.5 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground">
            {sorted.length} {sorted.length === 1 ? "episode" : "episodes"}
            {liveCount > 0 && <span className="text-signal"> · {liveCount} live</span>}
            <span className="text-muted-foreground/60"> · {timezone}</span>
          </p>
        </div>

        <div
          className="no-scrollbar flex items-center gap-4 overflow-x-auto max-sm:[mask-image:linear-gradient(to_right,black_88%,transparent)]"
          role="group"
          aria-label="Filter by format"
        >
          {FORMAT_FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setFormatFilter(filter)}
              aria-pressed={formatFilter === filter}
              className={cn(
                "relative shrink-0 border-b pb-1 font-mono text-[0.6rem] uppercase tracking-[0.14em] transition-colors before:absolute before:-inset-x-1.5 before:-inset-y-2.5 before:content-['']",
                formatFilter === filter
                  ? "border-signal text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {formatFilterLabel(filter)}
            </button>
          ))}
        </div>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          title={`No ${formatFilterLabel(formatFilter)} airing`}
          description="Try another format."
        />
      ) : (
        bands.map((band, index) => {
          const phases = band.items.map((schedule) => getPhase(schedule.airingAt, now));
          const hasUpcoming = phases.includes("upcoming");
          const hasLive = phases.includes("live");
          const isNext =
            hasUpcoming &&
            !bands
              .slice(0, index)
              .some((previous) =>
                previous.items.some((schedule) => getPhase(schedule.airingAt, now) === "upcoming"),
              );

          return (
            <div key={band.hour} className="space-y-1">
              {isToday && isNext && (
                <div
                  id="now-indicator"
                  className="flex items-center gap-3 py-1"
                  role="separator"
                  aria-label="Current time"
                >
                  <span className="relative flex size-2 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-60" />
                    <span className="relative inline-flex size-1 rounded-full bg-signal" />
                  </span>
                  <LocalTime
                    timestamp={now}
                    offsetMinutes={offset}
                    className="font-mono text-[0.62rem] font-semibold tabular-nums text-signal"
                  />
                  <span className="h-px flex-1 bg-signal/20" />
                  <span className="font-mono text-[0.56rem] uppercase tracking-[0.18em] text-muted-foreground">
                    Now
                  </span>
                </div>
              )}

              <div id={`band-${band.hour}`} className="flex scroll-mt-40 items-center gap-3 pt-3">
                <span
                  className={cn(
                    "font-mono text-sm font-semibold tabular-nums tracking-tight",
                    hasLive ? "text-signal" : "text-foreground/80",
                  )}
                >
                  {String(band.hour).padStart(2, "0")}:00
                </span>
                <span className="h-px flex-1 bg-border-soft" />
                <span className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-muted-foreground/70">
                  {band.items.length}
                </span>
              </div>

              <div>
                {band.items.map((item) => (
                  <ScheduleRow
                    key={`${item.media!.id}-${item.episode}`}
                    item={item}
                    now={now}
                    offsetMinutes={offset}
                  />
                ))}
              </div>
            </div>
          );
        })
      )}
    </section>
  );
}

function ScheduleRow({
  item,
  now,
  offsetMinutes,
}: {
  item: AiringScheduleNode;
  now: number;
  offsetMinutes?: number;
}) {
  const media = item.media!;
  const title = getTitle(media.title);
  const phase = getPhase(item.airingAt, now);
  const isLive = phase === "live";
  const isUpcoming = phase === "upcoming";
  const countdown = isUpcoming ? formatCountdown(item.airingAt, now) : "";
  const streamingLinks = getStreamingLinks(media.externalLinks);
  const progress =
    media.episodes != null
      ? Math.min(100, Math.round((item.episode / media.episodes) * 100))
      : null;

  if (phase === "aired" && !isLive) {
    return (
      <Link
        href={`/anime/${media.id}` as Route<string>}
        aria-label={`Open ${title}`}
        className="group flex items-center gap-3 border-b border-border-soft py-1.5 opacity-65 transition-opacity hover:opacity-100"
      >
        <span className="w-12 shrink-0 font-mono text-[0.6rem] tabular-nums text-muted-foreground">
          <LocalTime timestamp={item.airingAt} offsetMinutes={offsetMinutes} />
        </span>
        <span className="relative aspect-[2/3] w-7 shrink-0 overflow-hidden rounded-[2px] bg-surface-2">
          {media.coverImage.medium && (
            <MediaImage
              src={media.coverImage.medium}
              alt=""
              fill
              sizes="28px"
              loading="lazy"
              className="object-cover"
            />
          )}
        </span>
        <span className="min-w-0 flex-1 truncate font-serif text-sm text-foreground/85 transition-colors group-hover:text-signal">
          {title}
        </span>
        <span className="shrink-0 font-mono text-[0.56rem] text-muted-foreground/60">
          Ep {item.episode} · {formatAgo(item.airingAt, now)} ago
        </span>
      </Link>
    );
  }

  return (
    <div className={cn("border-b border-border-soft", isLive && "bg-signal/[0.045]")}>
      <Link
        href={`/anime/${media.id}` as Route<string>}
        aria-label={`Open ${title}`}
        className="group flex items-center gap-4 py-3"
      >
        <div className="flex w-14 shrink-0 flex-col items-center gap-0.5">
          <LocalTime
            timestamp={item.airingAt}
            offsetMinutes={offsetMinutes}
            className={cn(
              "font-mono text-sm tabular-nums",
              isLive ? "font-semibold text-signal" : "font-medium text-foreground/85",
            )}
          />
          <span
            className={cn(
              "font-mono text-[0.52rem] uppercase tracking-[0.14em]",
              isLive ? "text-signal" : "text-muted-foreground/60",
            )}
          >
            {isLive ? "Live" : isUpcoming ? "Airs" : "Aired"}
          </span>
        </div>

        <div className="relative aspect-[2/3] w-14 shrink-0 overflow-hidden rounded-[2px] bg-surface-2">
          {media.coverImage.medium ? (
            <MediaImage
              src={media.coverImage.medium}
              alt=""
              fill
              sizes="56px"
              loading="lazy"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transform-none"
            />
          ) : (
            <div className="flex h-full items-center justify-center p-1 text-center font-mono text-[0.45rem] text-muted-foreground">
              {title}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <p className="line-clamp-1 font-serif text-base leading-snug text-foreground transition-colors group-hover:text-signal sm:text-lg">
              {title}
            </p>
            {isUpcoming && (
              <span className="shrink-0 font-mono text-[0.6rem] tabular-nums text-muted-foreground">
                in {countdown}
              </span>
            )}
          </div>
          <p className="mt-0.5 font-mono text-[0.55rem] uppercase tracking-[0.1em] text-muted-foreground/75">
            Ep {item.episode}
            {media.episodes ? `/${media.episodes}` : ""}
            {media.format ? ` · ${formatFormat(media.format)}` : ""}
            {media.duration ? ` · ${media.duration}m` : ""}
          </p>
          {progress !== null && (
            <span className="mt-1.5 block h-px w-full max-w-48 overflow-hidden bg-border-soft">
              <span
                className={cn("block h-full", isLive ? "bg-signal" : "bg-foreground/35")}
                style={{ width: `${progress}%` }}
              />
            </span>
          )}
        </div>
      </Link>

      {streamingLinks.length > 0 && (
        <div className="flex items-center gap-3 pb-2 pl-[4.5rem]">
          {streamingLinks.slice(0, 3).map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              title={`Watch on ${link.site ?? "streaming"}`}
              className="flex items-center gap-1 font-mono text-[0.55rem] uppercase tracking-[0.1em] text-muted-foreground/70 transition-colors hover:text-foreground"
            >
              {getFaviconUrl(link.url) ? (
                <Image
                  src={getFaviconUrl(link.url)}
                  alt=""
                  width={12}
                  height={12}
                  className="size-3"
                  unoptimized
                />
              ) : null}
              <span className="max-w-24 truncate">{link.site ?? "Watch"}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export function AiringTimelineSkeleton() {
  return (
    <section className="space-y-6" aria-label="Day lineup">
      <div className="border-b border-border-soft pb-4">
        <Skeleton className="h-9 w-40 rounded-[2px]" />
        <Skeleton className="mt-2 h-3 w-56 rounded-[2px]" />
      </div>
      <div className="flex items-center gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-4 w-10 rounded-[2px]" />
        ))}
      </div>
      {Array.from({ length: 3 }).map((_, band) => (
        <div key={band} className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-10 rounded-[2px]" />
            <Skeleton className="h-px flex-1" />
          </div>
          {Array.from({ length: band === 1 ? 2 : 1 }).map((_, row) => (
            <div key={row} className="flex items-center gap-4 border-b border-border-soft py-3">
              <div className="flex w-14 shrink-0 flex-col items-center gap-1">
                <Skeleton className="h-4 w-10 rounded-[2px]" />
                <Skeleton className="h-2 w-7 rounded-[2px]" />
              </div>
              <Skeleton className="aspect-[2/3] w-14 rounded-[2px]" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4 max-w-sm rounded-[2px]" />
                <Skeleton className="h-2.5 w-32 rounded-[2px]" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}
