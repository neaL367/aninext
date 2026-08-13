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
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
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

function formatFilterLabel(f: (typeof FORMAT_FILTERS)[number]): string {
  if (f === "ALL") return "All";
  if (f === "TV_SHORT") return "TV Short";
  return formatFormat(f);
}

function formatEpisodeSummary(total: number, live: number, upcoming: number): string {
  if (total === 0) return "0 episodes";
  if (live === total) return `${total} episodes live now`;
  if (upcoming === total) return `${total} episodes coming up`;
  const parts = [`${total} episodes`];
  if (live > 0) parts.push(`${live} live now`);
  if (upcoming > 0) parts.push(`${upcoming} coming up`);
  return parts.join(" · ");
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
  // The offset that defines the fetched day — display follows it, not the
  // browser's ambient timezone, so shared links stay consistent.
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
  // "Is today" is judged in the offset's timezone (the day the data was fetched
  // for) — not the browser's ambient tz — so the NOW marker and day label stay
  // consistent for shared links and stale offsets.
  const isToday = useMemo(() => day === getOffsetTodayStr(offset), [day, offset]);
  const timezone = useMemo(() => getTimezoneLabel(offset), [offset]);
  const [formatFilter, setFormatFilter] = useState<(typeof FORMAT_FILTERS)[number]>("ALL");
  const didAutoScroll = useRef(false);

  const visible = useMemo(
    () => schedules.filter((s) => s.media && !isAdultContent(s.media)),
    [schedules],
  );
  const filtered = useMemo(
    () =>
      formatFilter === "ALL" ? visible : visible.filter((s) => s.media?.format === formatFilter),
    [visible, formatFilter],
  );
  const sorted = useMemo(() => [...filtered].sort((a, b) => a.airingAt - b.airingAt), [filtered]);

  // Group by local hour (in the offset's timezone) — time is the primary axis.
  const bands = useMemo<Band[]>(() => {
    const map = new Map<number, AiringScheduleNode[]>();
    for (const s of sorted) {
      const hour = getOffsetHour(s.airingAt, offset);
      const list = map.get(hour) ?? [];
      list.push(s);
      map.set(hour, list);
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]).map(([hour, items]) => ({ hour, items }));
  }, [sorted, offset]);

  const liveCount = useMemo(
    () => sorted.filter((s) => getPhase(s.airingAt, now) === "live").length,
    [sorted, now],
  );
  const upcomingCount = useMemo(
    () => sorted.filter((s) => getPhase(s.airingAt, now) === "upcoming").length,
    [sorted, now],
  );

  // Bring the first upcoming band into view on load (today only, only if it's
  // below the fold) so the page opens like a live TV guide at "now".
  useEffect(() => {
    if (!isToday || didAutoScroll.current || bands.length === 0) return;
    const firstUpcomingBand = bands.find((b) =>
      b.items.some((s) => getPhase(s.airingAt, now) === "upcoming"),
    );
    const el = firstUpcomingBand
      ? document.getElementById(`band-${firstUpcomingBand.hour}`)
      : document.getElementById("now-indicator");
    if (el && el.getBoundingClientRect().top > window.innerHeight * 0.8) {
      didAutoScroll.current = true;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per day mount
  }, [isToday, bands]);

  if (visible.length === 0) {
    return (
      <EmptyState
        icon={CalendarIcon}
        title="Nothing airing this day"
        description="Choose another day to scan the week."
      />
    );
  }

  return (
    <section className="space-y-5" aria-label="Day lineup">
      {/* Header + filters */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-signal">Schedule</p>
          <div className="mt-2">
            <h2 className="text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
              {isToday ? "Today's lineup" : formatDayLabel(day)}
            </h2>
          </div>
          <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted-foreground">
            {formatEpisodeSummary(filtered.length, liveCount, upcomingCount)}
            <span className="text-muted-foreground/70"> · times in {timezone}</span>
          </p>
        </div>

        <div
          className="no-scrollbar flex items-center gap-1 overflow-x-auto rounded-full border border-border-soft bg-surface-1/40 p-1"
          role="group"
          aria-label="Filter by format"
        >
          {FORMAT_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFormatFilter(f)}
              aria-pressed={formatFilter === f}
              className={cn(
                "shrink-0 rounded-full px-3 py-1 font-mono text-[0.62rem] font-bold uppercase tracking-[0.12em] transition-colors",
                formatFilter === f
                  ? "bg-signal text-white"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {formatFilterLabel(f)}
            </button>
          ))}
        </div>
      </div>

      {/* Time bands (or a filter-specific empty state) */}
      {sorted.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          title={`No ${formatFilterLabel(formatFilter)} airing this day`}
          description="Try another format above or switch back to All."
        />
      ) : (
        bands.map((band, i) => {
          const phases = band.items.map((s) => getPhase(s.airingAt, now));
          const hasUpcoming = phases.includes("upcoming");
          const hasLive = phases.includes("live");
          const isNext =
            hasUpcoming &&
            !bands
              .slice(0, i)
              .some((b) => b.items.some((s) => getPhase(s.airingAt, now) === "upcoming"));

          return (
            <div key={band.hour} className="space-y-2">
              {/* NOW indicator before the first upcoming band */}
              {isToday && isNext && (
                <div
                  id="now-indicator"
                  className="flex items-center gap-3 py-1"
                  role="separator"
                  aria-label="Current time"
                >
                  <span className="relative flex size-2.5 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-60" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-destructive" />
                  </span>
                  <LocalTime
                    timestamp={now}
                    offsetMinutes={offset}
                    className="font-mono text-xs font-bold tabular-nums text-destructive"
                  />
                  <span className="h-px flex-1 bg-destructive/20" />
                  <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
                    Now
                  </span>
                </div>
              )}

              {/* Band header — time as the axis */}
              <div id={`band-${band.hour}`} className="scroll-mt-[11rem] flex items-center gap-3">
                <span className="flex items-center gap-2">
                  {hasLive && (
                    <span className="size-1.5 animate-pulse rounded-full bg-destructive" />
                  )}
                  <span
                    className={cn(
                      "font-mono text-sm font-bold tabular-nums tracking-tight",
                      hasLive ? "text-destructive" : "text-foreground",
                    )}
                  >
                    {String(band.hour).padStart(2, "0")}:00
                  </span>
                </span>
                <span className="h-px flex-1 bg-border-soft" />
                <span className="shrink-0 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
                  {band.items.length} {band.items.length === 1 ? "show" : "shows"}
                </span>
              </div>

              {/* Rows — progressive density: live large, upcoming standard, aired compact */}
              <div className="space-y-2">
                {band.items.map((item) => {
                  const density: "featured" | "standard" | "compact" = hasLive
                    ? "featured"
                    : getPhase(item.airingAt, now) === "upcoming"
                      ? "standard"
                      : "compact";
                  return (
                    <ScheduleRow
                      key={`${item.media!.id}-${item.episode}`}
                      item={item}
                      now={now}
                      density={density}
                      offsetMinutes={offset}
                    />
                  );
                })}
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
  density,
  offsetMinutes,
}: {
  item: AiringScheduleNode;
  now: number;
  density: "featured" | "standard" | "compact";
  offsetMinutes?: number;
}) {
  const media = item.media!;
  const title = getTitle(media.title);
  const phase = getPhase(item.airingAt, now);
  const isClose = phase === "upcoming" && item.airingAt - now < 3600;
  const countdown = phase === "upcoming" ? formatCountdown(item.airingAt, now) : "";
  const streamingLinks = getStreamingLinks(media.externalLinks);
  const pct =
    media.episodes != null
      ? Math.min(100, Math.round((item.episode / media.episodes) * 100))
      : null;

  if (density === "compact") {
    return (
      <Link
        href={`/anime/${media.id}` as Route<string>}
        aria-label={`Open ${title}`}
        className="group flex items-center gap-3 rounded-md px-3 py-1.5 opacity-60 transition-[background-color,opacity] hover:bg-surface-1/60 hover:opacity-100"
      >
        <span className="w-12 shrink-0 font-mono text-[0.65rem] tabular-nums text-muted-foreground">
          <LocalTime timestamp={item.airingAt} offsetMinutes={offsetMinutes} />
        </span>
        <span
          className="relative aspect-[2/3] w-9 shrink-0 overflow-hidden rounded bg-surface-2"
          style={media.coverImage.color ? { backgroundColor: media.coverImage.color } : undefined}
        >
          {media.coverImage.medium ? (
            <MediaImage
              src={media.coverImage.medium}
              alt=""
              fill
              sizes="36px"
              loading="lazy"
              className="object-cover"
            />
          ) : null}
        </span>
        <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground/85 transition-colors group-hover:text-signal">
          {title}
        </span>
        <span className="shrink-0 font-mono text-[0.6rem] text-muted-foreground">
          Ep {item.episode}
        </span>
        <span className="shrink-0 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted-foreground/70">
          Aired · {formatAgo(item.airingAt, now)}
        </span>
      </Link>
    );
  }

  const isFeatured = density === "featured";

  return (
    <div
      className={cn(
        "rounded-xl border border-border-soft/60 bg-surface-1/30 transition-colors duration-200 hover:border-signal/50 hover:bg-surface-1",
        "content-visibility-auto [contain-intrinsic-size:auto_8rem]",
        isFeatured && "border-destructive/40 bg-destructive/[0.04] hover:border-destructive/70",
      )}
    >
      <Link
        href={`/anime/${media.id}` as Route<string>}
        aria-label={`Open ${title}`}
        className="group flex items-center gap-4 p-3 sm:p-4"
      >
        {/* Time */}
        <div className="flex w-14 shrink-0 flex-col items-center gap-1 sm:w-16">
          <LocalTime
            timestamp={item.airingAt}
            offsetMinutes={offsetMinutes}
            className={cn(
              "font-mono tabular-nums",
              isFeatured
                ? "text-sm font-extrabold text-destructive sm:text-base"
                : "text-xs font-bold text-foreground sm:text-sm",
            )}
          />
          <span
            className={cn(
              "font-mono text-[0.55rem] uppercase tracking-[0.12em]",
              phase === "live" ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {phase === "live" ? "Live" : phase === "upcoming" ? "Airs" : "Aired"}
          </span>
        </div>

        {/* Image — larger for the important entries */}
        <div
          className={cn(
            "relative aspect-[2/3] shrink-0 overflow-hidden rounded-md border border-border-soft bg-surface-2",
            isFeatured ? "w-24 sm:w-28" : "w-16 sm:w-20",
          )}
          style={media.coverImage.color ? { backgroundColor: media.coverImage.color } : undefined}
        >
          {media.coverImage.medium ? (
            <MediaImage
              src={media.coverImage.medium}
              alt=""
              fill
              sizes={isFeatured ? "112px" : "80px"}
              loading="lazy"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full items-center justify-center p-1 text-center font-mono text-[0.5rem] text-muted-foreground">
              {title}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p
              className={cn(
                "min-w-0 truncate font-semibold text-foreground transition-colors group-hover:text-signal",
                isFeatured ? "text-base sm:text-lg" : "text-sm sm:text-base",
              )}
            >
              {title}
            </p>
            {isFeatured && (
              <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-destructive/15 px-2 py-0.5 font-mono text-[0.6rem] font-bold uppercase tracking-[0.14em] text-destructive">
                <span className="size-1 animate-pulse rounded-full bg-destructive" />
                Airing now
              </span>
            )}
            {phase === "upcoming" && isClose && (
              <span className="shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 font-mono text-[0.62rem] font-bold tabular-nums text-destructive">
                in {countdown}
              </span>
            )}
          </div>

          <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 font-mono text-[0.65rem] text-muted-foreground">
            <span>
              Ep {item.episode}
              {media.episodes ? `/${media.episodes}` : ""}
            </span>
            {media.format && <span>· {formatFormat(media.format)}</span>}
            {media.duration ? <span>· {media.duration}m</span> : null}
          </div>

          {pct !== null && (
            <div className="mt-2 flex items-center gap-2">
              <span className="h-1 w-full max-w-44 overflow-hidden rounded-full bg-surface-3">
                <span
                  className={cn(
                    "block h-full rounded-full transition-[width] duration-700 ease-out",
                    isFeatured ? "bg-destructive" : "bg-signal",
                  )}
                  style={{ width: `${pct}%` }}
                />
              </span>
              <span className="font-mono text-[0.6rem] tabular-nums text-muted-foreground/70">
                {pct}%
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Streaming — real links, open in a new tab */}
      {streamingLinks.length > 0 && (
        <div className="flex items-center gap-2 border-t border-border-soft/60 px-3 pb-2.5 pt-2 sm:px-4">
          {streamingLinks.slice(0, 3).map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              title={`Watch on ${link.site ?? "streaming"}`}
              className="flex items-center gap-1.5 rounded-md border border-border-soft bg-surface-1 px-2.5 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:border-signal/60 hover:text-foreground"
            >
              {getFaviconUrl(link.url) ? (
                <Image
                  src={getFaviconUrl(link.url)}
                  alt=""
                  width={14}
                  height={14}
                  className="size-3.5"
                  unoptimized
                />
              ) : link.icon ? (
                <Image
                  src={link.icon}
                  alt=""
                  width={14}
                  height={14}
                  className="size-3.5"
                  unoptimized
                />
              ) : null}
              <span className="max-w-28 truncate">{link.site ?? "Watch"}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export function AiringTimelineSkeleton() {
  return (
    <section className="space-y-5" aria-label="Day lineup">
      <div>
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="mt-2 h-8 w-52" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>

      <div className="flex items-center gap-1 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-14 rounded-full" />
        ))}
      </div>

      {Array.from({ length: 3 }).map((_, b) => (
        <div key={b} className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-px flex-1" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: b === 1 ? 2 : 1 }).map((__, r) => (
              <div
                key={r}
                className="flex items-center gap-4 rounded-xl border border-border-soft/60 bg-surface-1/30 p-3 sm:p-4"
              >
                <div className="flex w-14 shrink-0 flex-col items-center gap-1 sm:w-16">
                  <Skeleton className="h-4 w-10" />
                  <Skeleton className="h-2 w-8" />
                </div>
                <Skeleton className="aspect-[2/3] w-16 rounded-md sm:w-20" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4 max-w-sm" />
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-1 w-44 rounded-full" />
                  <div className="flex gap-1.5 pt-0.5">
                    <Skeleton className="h-5 w-20 rounded-md" />
                    <Skeleton className="h-5 w-16 rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
