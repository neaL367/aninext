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
    () => schedules.filter((s) => s.media && !isAdultContent(s.media)),
    [schedules],
  );
  const sorted = useMemo(() => [...items].sort((a, b) => a.airingAt - b.airingAt), [items]);

  const live = sorted.filter((s) => getPhase(s.airingAt, now) === "live");
  const upcoming = sorted.filter((s) => getPhase(s.airingAt, now) === "upcoming");
  const featured = live[0] ?? upcoming[0] ?? sorted[0];
  const upNext = upcoming.filter((s) => s !== featured).slice(0, 3);

  if (!featured) return null;

  const media = featured.media!;
  const title = getTitle(media.title);
  const phase = getPhase(featured.airingAt, now);
  const countdown = phase === "upcoming" ? formatCountdown(featured.airingAt, now) : "";
  const streamingLinks = getStreamingLinks(media.externalLinks);
  const banner = media.bannerImage ?? media.coverImage.extraLarge;
  const color = media.coverImage.color;

  const label =
    phase === "live" ? "Airing now" : phase === "upcoming" ? "Coming next" : "Recently aired";

  return (
    <div className="space-y-5">
      {/* Now / Next block */}
      <section
        aria-label={label}
        className="relative overflow-hidden rounded-2xl border border-border-soft"
      >
        {/* Artwork backdrop — right side only, so the block stays compact */}
        <div className="absolute inset-0 bg-surface-2">
          {banner ? (
            <MediaImage
              src={banner}
              alt=""
              fill
              priority
              sizes="(min-width: 1280px) 60vw, 100vw"
              className="object-cover object-top"
            />
          ) : null}
          <div
            className="absolute inset-0"
            style={
              color && !banner
                ? { background: `linear-gradient(120deg, ${color} 0%, transparent 60%)` }
                : undefined
            }
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background via-background/70 to-background/25" />
        </div>

        <div className="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:gap-7 sm:p-7">
          {/* Poster */}
          <Link
            href={`/anime/${media.id}` as Route<string>}
            aria-label={`Open ${title}`}
            className="group hidden shrink-0 sm:block"
          >
            <div className="relative aspect-[2/3] w-28 overflow-hidden rounded-lg border border-border-soft/80 bg-surface-2 shadow-xl shadow-black/40 md:w-32">
              {media.coverImage.large ? (
                <MediaImage
                  src={media.coverImage.large}
                  alt={`${title} cover`}
                  fill
                  sizes="128px"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="aspect-[2/3]" />
              )}
            </div>
          </Link>

          {/* Copy */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[0.62rem] font-bold uppercase tracking-[0.14em]",
                  phase === "live"
                    ? "bg-destructive/15 text-destructive"
                    : "bg-signal-soft text-signal",
                )}
              >
                {phase === "live" ? (
                  <RadioIcon className="size-3 animate-pulse" />
                ) : (
                  <ClockIcon className="size-3" />
                )}
                {label}
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-border-soft bg-background/60 px-2.5 py-1 font-mono text-xs tabular-nums text-foreground backdrop-blur">
                <LocalTime timestamp={featured.airingAt} offsetMinutes={offsetMinutes} />
                <span className="text-muted-foreground/60">·</span>
                <span className="text-muted-foreground">{formatFormat(media.format ?? "")}</span>
              </span>
            </div>

            <Link
              href={`/anime/${media.id}` as Route<string>}
              className="mt-3 block"
              aria-label={`Open ${title}`}
            >
              <h2 className="line-clamp-2 max-w-2xl text-2xl font-semibold tracking-[-0.04em] text-foreground transition-colors hover:text-signal sm:text-3xl lg:text-4xl">
                {title}
              </h2>
            </Link>

            <p className="mt-1.5 font-mono text-xs text-muted-foreground">
              Episode {featured.episode}
              {phase === "live" && (
                <span className="ml-2 text-foreground/80">
                  · started {formatAgo(featured.airingAt, now)}
                </span>
              )}
              {phase === "upcoming" && countdown && (
                <span className="ml-2 text-foreground/80">· next episode in {countdown}</span>
              )}
              {phase === "aired" && (
                <span className="ml-2 text-foreground/80">
                  · {formatAgo(featured.airingAt, now)}
                </span>
              )}
            </p>

            <div className="mt-4 max-w-xl">
              <EpisodeProgress
                episode={featured.episode}
                total={media.episodes}
                className="[&_[role=progressbar]]:max-w-full"
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link
                href={`/anime/${media.id}` as Route<string>}
                className="inline-flex items-center gap-1.5 rounded-lg bg-signal px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-signal-strong"
              >
                Open anime
                <ArrowRightIcon className="size-4" />
              </Link>

              {streamingLinks.length > 0 && (
                <a
                  href={streamingLinks[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border-soft bg-background/70 px-3.5 py-2 text-sm font-medium text-foreground backdrop-blur transition-colors hover:border-signal/60"
                >
                  <PlayIcon className="size-3.5" />
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
                  className="flex size-8 items-center justify-center rounded-lg border border-border-soft bg-background/70 backdrop-blur transition-colors hover:border-signal/60"
                >
                  {link.icon ? (
                    <Image
                      src={link.icon}
                      alt=""
                      width={16}
                      height={16}
                      className="size-4"
                      unoptimized
                    />
                  ) : (
                    <Image
                      src={getFaviconUrl(link.url)}
                      alt=""
                      width={16}
                      height={16}
                      className="size-4"
                      unoptimized
                    />
                  )}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Up next — compact quick scan */}
      {upNext.length > 0 && (
        <section aria-label="Up next" className="space-y-2">
          <p className="eyebrow px-1 text-signal">Up next</p>
          <div className="divide-y divide-border-soft/60 rounded-xl border border-border-soft bg-surface-1/30">
            {upNext.map((item) => {
              const m = item.media!;
              const itemCountdown = formatCountdown(item.airingAt, now);
              return (
                <Link
                  key={`${m.id}-${item.episode}`}
                  href={`/anime/${m.id}` as Route<string>}
                  className="group flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-surface-1"
                >
                  <span className="w-14 shrink-0 font-mono text-xs font-bold tabular-nums text-foreground">
                    <LocalTime timestamp={item.airingAt} offsetMinutes={offsetMinutes} />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground transition-colors group-hover:text-signal">
                    {getTitle(m.title)}
                  </span>
                  <span className="shrink-0 font-mono text-[0.65rem] text-muted-foreground">
                    Ep {item.episode}
                  </span>
                  {itemCountdown && (
                    <span className="w-20 shrink-0 text-right font-mono text-[0.65rem] font-semibold tabular-nums text-destructive">
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
      <div className="relative overflow-hidden rounded-2xl border border-border-soft bg-surface-2">
        <div className="absolute inset-0 shimmer opacity-60" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background via-background/70 to-background/25" />
        <div className="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:gap-7 sm:p-7">
          <div className="hidden shrink-0 sm:block">
            <Skeleton className="aspect-[2/3] w-28 rounded-lg md:w-32" />
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-5 w-28 rounded-full" />
            </div>
            <Skeleton className="h-9 w-3/4 max-w-xl" />
            <Skeleton className="h-3.5 w-48" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-1 w-56 rounded-full" />
            </div>
            <div className="flex items-center gap-3 pt-1">
              <Skeleton className="h-9 w-28 rounded-lg" />
              <Skeleton className="h-9 w-40 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-16" />
        <div className="divide-y divide-border-soft/60 rounded-xl border border-border-soft bg-surface-1/30">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2.5">
              <Skeleton className="h-3.5 w-12" />
              <Skeleton className="h-4 w-2/3 max-w-md" />
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3 w-14" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
