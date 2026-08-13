import Link from "next/link";
import { ViewTransition } from "react";

import { MediaImage } from "@/components/ui/media-image";
import {
  formatFormat,
  formatStatus,
  getMediaCover,
  getMediaTitle,
} from "@/features/anime/lib/media-helpers";
import { cn } from "@/lib/utils";

import { MediaScore } from "./media-score";

import type { CoverTier } from "@/features/anime/lib/media-helpers";
import type { Media } from "@/features/anime/types/anime";
import type { Route } from "next";

export function MediaCard({
  media,
  size = "default",
  rank,
  viewTransition = false,
  priority = false,
  coverTier,
}: {
  media: Media;
  size?: "default" | "featured";
  rank?: number;
  viewTransition?: boolean;
  priority?: boolean;
  coverTier?: CoverTier;
}) {
  "use memo";
  const title = getMediaTitle(media);
  const cover = getMediaCover(media, coverTier);
  const color = media.coverImage.color;
  const score = media.averageScore;
  const isReleasing = media.status === "RELEASING";

  const coverImage = cover ? (
    <MediaImage
      src={cover}
      alt={`${title} cover`}
      fill
      priority={priority}
      sizes={
        size === "featured"
          ? "(min-width: 1024px) 42vw, 92vw"
          : "(min-width: 1280px) 16vw, (min-width: 768px) 24vw, 44vw"
      }
      className="object-cover transition-transform duration-500 group-hover:scale-[1.035] motion-reduce:transform-none transform-gpu will-change-transform"
    />
  ) : null;

  return (
    <Link
      href={`/anime/${media.id}` as Route<string>}
      aria-label={`Open ${title}`}
      className={cn(
        "group block min-w-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal",
        size === "featured" && "md:col-span-2",
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-md border border-border-soft bg-surface-2 transition-colors duration-300 group-hover:border-signal/60 motion-reduce:transform-none isolate transform-gpu",
          size === "featured" ? "aspect-[16/9]" : "aspect-[2/3]",
        )}
      >
        {coverImage ? (
          viewTransition ? (
            <ViewTransition name={`anime-cover-${media.id}`} share="morph" default="none">
              {coverImage}
            </ViewTransition>
          ) : (
            coverImage
          )
        ) : (
          <div className="flex h-full items-center justify-center p-5 text-center">
            <span className="max-w-[14rem] font-mono text-xs uppercase tracking-[0.12em] text-paper/75">
              {title}
            </span>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent" />

        {rank !== undefined && rank <= 100 && (
          <span
            className="pointer-events-none absolute left-3 top-3 flex size-8 items-center justify-center border border-white/35 font-mono text-xs font-semibold text-white backdrop-blur-sm"
            style={{ backgroundColor: color ?? "var(--signal-strong)" }}
          >
            {String(rank).padStart(2, "0")}
          </span>
        )}

        {score !== undefined && (
          <span className="pointer-events-none absolute right-3 top-3 rounded-sm bg-black/60 px-1.5 py-0.5 font-mono text-xs font-semibold tabular-nums backdrop-blur-sm">
            <MediaScore score={score} className="text-xs" />
          </span>
        )}

        {isReleasing && rank === undefined && (
          <span className="pointer-events-none absolute left-3 top-3 flex items-center gap-1.5 bg-live-badge px-2 py-1 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-white">
            <span className="size-1.5 animate-pulse rounded-full bg-white" />
            Live
          </span>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3.5">
          <p className="line-clamp-2 text-sm font-semibold leading-snug text-white">{title}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-b border-border-soft py-2.5">
        <p className="min-w-0 truncate font-mono text-[0.7rem] uppercase tracking-[0.06em] text-muted-foreground">
          {media.format
            ? formatFormat(media.format)
            : media.status
              ? formatStatus(media.status)
              : "Anime"}
          {media.episodes ? ` / ${media.episodes} ep` : ""}
        </p>
        {media.seasonYear && (
          <span className="shrink-0 font-mono text-[0.7rem] text-muted-foreground">
            {media.seasonYear}
          </span>
        )}
      </div>
    </Link>
  );
}

export function MediaCardSkeleton({ size = "default" }: { size?: "default" | "featured" }) {
  return (
    <div className={cn("min-w-0", size === "featured" && "md:col-span-2")}>
      <div
        className={cn(
          "relative overflow-hidden rounded-md border border-border-soft bg-surface-2 isolate",
          size === "featured" ? "aspect-[16/9]" : "aspect-[2/3]",
        )}
      >
        <div className="absolute inset-0 shimmer" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3.5 space-y-1.5">
          <div className="shimmer h-3.5 w-3/4 rounded" />
          <div className="shimmer h-3 w-1/2 rounded opacity-75" />
        </div>
      </div>
      <div className="flex items-center justify-between border-b border-border-soft py-2.5">
        <div className="shimmer h-3 w-20 rounded" />
        <div className="shimmer h-3 w-10 rounded" />
      </div>
    </div>
  );
}
