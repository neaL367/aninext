import Link from "next/link";
import { ViewTransition } from "react";

import { ImageWithLoading } from "@/components/image-with-loading";
import {
  formatFormat,
  formatStatus,
  getMediaCover,
  getMediaTitle,
} from "@/features/anime/lib/media-helpers";
import { scoreColor } from "@/features/anime/lib/score";
import { cn } from "@/lib/utils";

import type { Media } from "@/features/anime/types/anime";
import type { Route } from "next";

export function MediaCard({
  media,
  size = "default",
  rank,
  viewTransition = false,
  vtIndex,
  priority = false,
}: {
  media: Media;
  size?: "default" | "featured";
  rank?: number;
  viewTransition?: boolean;
  vtIndex?: number;
  priority?: boolean;
}) {
  const title = getMediaTitle(media);
  const cover = getMediaCover(media);
  const color = media.coverImage.color;
  const score = media.averageScore;
  const isReleasing = media.status === "RELEASING";

  const coverImage = cover ? (
    <ImageWithLoading
      src={cover}
      alt={`${title} cover`}
      fill
      priority={priority}
      sizes={
        size === "featured"
          ? "(min-width: 1024px) 42vw, 92vw"
          : "(min-width: 1280px) 16vw, (min-width: 768px) 24vw, 44vw"
      }
      className="object-cover transition-transform duration-500 group-hover:scale-[1.035] motion-reduce:transform-none"
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
          "relative overflow-hidden border border-border-soft bg-surface-1 transition-[border-color,transform] duration-300 group-hover:-translate-y-1 group-hover:border-signal/55 motion-reduce:transform-none",
          size === "featured" ? "aspect-[16/9]" : "aspect-[2/3]",
        )}
        style={
          !cover && color
            ? { background: `linear-gradient(135deg, ${color}55, var(--surface-2) 72%)` }
            : undefined
        }
      >
        {coverImage ? (
          viewTransition ? (
            <ViewTransition
              name={`anime-cover-grid-${media.id}-${vtIndex ?? 0}`}
              share="morph"
              default="none"
            >
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
            className="absolute left-3 top-3 flex size-8 items-center justify-center border border-white/35 font-mono text-xs font-semibold text-white backdrop-blur-sm"
            style={{ backgroundColor: color ?? "var(--signal-strong)" }}
          >
            {String(rank).padStart(2, "0")}
          </span>
        )}

        {score !== undefined && (
          <span
            className={cn(
              "absolute right-3 top-3 rounded-sm bg-black/60 px-1.5 py-0.5 font-mono text-xs font-semibold tabular-nums backdrop-blur-sm",
              scoreColor(score),
            )}
          >
            {(score / 10).toFixed(1)}
          </span>
        )}

        {isReleasing && rank === undefined && (
          <span className="absolute left-3 top-3 flex items-center gap-1.5 bg-live-badge px-2 py-1 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-white">
            <span className="size-1.5 animate-pulse rounded-full bg-white" />
            Live
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 p-3.5">
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
          "shimmer border border-border-soft",
          size === "featured" ? "aspect-[16/9]" : "aspect-[2/3]",
        )}
      />
      <div className="flex items-center justify-between border-b border-border-soft py-2.5">
        <div className="shimmer h-2.5 w-24 rounded" />
        <div className="shimmer h-2.5 w-8 rounded" />
      </div>
    </div>
  );
}
