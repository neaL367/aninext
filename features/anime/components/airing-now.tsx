"use client";

import { ArrowRightIcon, ClockIcon, PlayIcon, RadioIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

import { LocalTime } from "@/components/ui/local-time";
import { MediaImage } from "@/components/ui/media-image";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatCountdown,
  formatFormat,
  getFaviconUrl,
  getStreamingLinks,
  getTitle,
} from "@/features/anime/lib/media-helpers";
import { cn } from "@/lib/utils";

import { useNow } from "../hooks/use-now";
import { FILTER_ADULT_GENRES } from "../lib/filter-constants";
import { EpisodeProgress } from "./episode-progress";

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

function formatAgo(airingAt: number, now: number): string {
  const mins = Math.floor((now - airingAt) / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function AiringNow({
  schedules,
  offsetMinutes,
}: {
  schedules: AiringScheduleNode[];
  offsetMinutes?: number;
}) {
  "use memo";
  const now = useNow();

  const items = useMemo(
    () => schedules.filter((schedule) => schedule.media && !isAdultContent(schedule.media)),
    [schedules],
  );
  const sorted = useMemo(() => [...items].sort((a, b) => a.airingAt - b.airingAt), [items]);

  const live = sorted.filter((schedule) => getPhase(schedule.airingAt, now) === "live");
  const upcoming = sorted.filter((schedule) => getPhase(schedule.airingAt, now) === "upcoming");
  const featured = live[0] ?? upcoming[0] ?? sorted[0];
  const upNext = upcoming.filter((schedule) => schedule !== featured).slice(0, 3);

  if (!featured) return null;

  const media = featured.media!;
  const title = getTitle(media.title);
  const phase = getPhase(featured.airingAt, now);
  const countdown = phase === "upcoming" ? formatCountdown(featured.airingAt, now) : "";
  const streamingLinks = getStreamingLinks(media.externalLinks);
  const banner = media.bannerImage ?? media.coverImage.extraLarge;
  const color = media.coverImage.color;

  const label = phase === "live" ? "Live" : phase === "upcoming" ? "Next" : "Aired";

  return (
    <div className="space-y-5">
      <section
        aria-label={`${label}: ${title}`}
        className="relative overflow-hidden rounded-[3px] bg-surface-2"
      >
        {banner && (
          <MediaImage
            src={banner}
            alt=""
            fill
            priority
            sizes="(min-width: 1280px) 60vw, 100vw"
            className="object-cover object-[50%_25%]"
          />
        )}
        {!banner && color && (
          <div className="absolute inset-0" style={{ backgroundColor: color }} />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/20" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />

        <div className="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-7">
          <Link
            href={`/anime/${media.id}` as Route<string>}
            aria-label={`Open ${title}`}
            className="group hidden shrink-0 sm:block"
          >
            <div className="relative aspect-[2/3] w-24 overflow-hidden rounded-[3px] bg-surface-2 md:w-28">
              {media.coverImage.large && (
                <MediaImage
                  src={media.coverImage.large}
                  alt={`${title} cover`}
                  fill
                  sizes="112px"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transform-none"
                />
              )}
            </div>
          </Link>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3 font-mono text-[0.58rem] uppercase tracking-[0.16em]">
              <span
                className={cn(
                  "flex items-center gap-1.5",
                  phase === "live" ? "text-signal" : "text-muted-foreground",
                )}
              >
                {phase === "live" ? (
                  <RadioIcon className="size-3 animate-pulse" />
                ) : (
                  <ClockIcon className="size-3" />
                )}
                {label}
              </span>
              <span className="flex items-center gap-1.5 tabular-nums text-muted-foreground">
                <LocalTime timestamp={featured.airingAt} offsetMinutes={offsetMinutes} />
                {media.format && <span>· {formatFormat(media.format)}</span>}
              </span>
            </div>

            <Link
              href={`/anime/${media.id}` as Route<string>}
              className="mt-2 block"
              aria-label={`Open ${title}`}
            >
              <h2 className="line-clamp-2 max-w-2xl font-serif text-2xl leading-[1.05] tracking-[-0.03em] text-foreground transition-colors hover:text-signal sm:text-3xl lg:text-4xl">
                {title}
              </h2>
            </Link>

            <p className="mt-2 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-muted-foreground">
              {phase === "live" && `Started ${formatAgo(featured.airingAt, now)}`}
              {phase === "upcoming" && countdown && `In ${countdown}`}
              {phase === "aired" && `Aired ${formatAgo(featured.airingAt, now)}`}
            </p>

            <div className="mt-3 max-w-md">
              <EpisodeProgress
                episode={featured.episode}
                total={media.episodes}
                className="[&_[role=progressbar]]:max-w-full"
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
              <Link
                href={`/anime/${media.id}` as Route<string>}
                className="inline-flex min-h-9 items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-foreground transition-colors hover:text-signal"
              >
                Open
                <ArrowRightIcon className="size-3" />
              </Link>

              {streamingLinks[0] && (
                <a
                  href={streamingLinks[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-9 items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground"
                >
                  <PlayIcon className="size-3" />
                  Watch{streamingLinks[0].site ? ` on ${streamingLinks[0].site}` : ""}
                </a>
              )}

              {streamingLinks.slice(1, 3).map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Watch on ${link.site ?? "streaming"}`}
                  className="flex items-center gap-1 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-muted-foreground/70 transition-colors hover:text-foreground"
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
                  {link.site}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {upNext.length > 0 && (
        <section aria-label="Up next" className="space-y-2">
          <p className="font-mono text-[0.56rem] uppercase tracking-[0.18em] text-muted-foreground/70">
            Up next
          </p>
          <div className="divide-y divide-border-soft border-t border-border-soft">
            {upNext.map((item) => {
              const itemMedia = item.media!;
              const itemCountdown = formatCountdown(item.airingAt, now);
              return (
                <Link
                  key={`${itemMedia.id}-${item.episode}`}
                  href={`/anime/${itemMedia.id}` as Route<string>}
                  className="group flex items-center gap-3 py-2.5"
                >
                  <span className="w-12 shrink-0 font-mono text-[0.62rem] tabular-nums text-foreground/80">
                    <LocalTime timestamp={item.airingAt} offsetMinutes={offsetMinutes} />
                  </span>
                  <span className="min-w-0 flex-1 truncate font-serif text-sm text-foreground transition-colors group-hover:text-signal">
                    {getTitle(itemMedia.title)}
                  </span>
                  <span className="shrink-0 font-mono text-[0.56rem] text-muted-foreground/70">
                    Ep {item.episode}
                  </span>
                  {itemCountdown && (
                    <span className="w-16 shrink-0 text-right font-mono text-[0.58rem] tabular-nums text-signal">
                      in {itemCountdown}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

export function AiringNowSkeleton() {
  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-[3px] bg-surface-2">
        <div className="absolute inset-0 shimmer" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-7">
          <div className="hidden shrink-0 sm:block">
            <Skeleton className="aspect-[2/3] w-24 rounded-[3px] md:w-28" />
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <Skeleton className="h-3 w-32 rounded-[2px]" />
            <Skeleton className="h-9 w-3/4 max-w-xl rounded-[2px]" />
            <Skeleton className="h-3 w-40 rounded-[2px]" />
            <Skeleton className="h-1 w-56 rounded-full" />
            <Skeleton className="h-3 w-24 rounded-[2px]" />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-14 rounded-[2px]" />
        <div className="divide-y divide-border-soft border-t border-border-soft">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 py-2.5">
              <Skeleton className="h-3.5 w-12 rounded-[2px]" />
              <Skeleton className="h-4 w-2/3 max-w-md rounded-[2px]" />
              <Skeleton className="h-3 w-10 rounded-[2px]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
