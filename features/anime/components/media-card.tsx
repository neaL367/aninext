import Link from "next/link";
import { ViewTransition } from "react";

import { MediaImage } from "@/components/ui/media-image";
import {
  formatFormat,
  getMediaCover,
  getMediaTitle,
  stripHtml,
} from "@/features/anime/lib/media-helpers";

import { MediaScore } from "./media-score";

import type { CoverTier } from "@/features/anime/lib/media-helpers";
import type { Media } from "@/features/anime/types/anime";
import type { Route } from "next";

export function MediaCard({
  media,
  rank,
  viewTransition = false,
  priority = false,
  coverTier,
}: {
  media: Media;
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
  const synopsis = stripHtml(media.description);
  const studio = media.studios?.nodes[0]?.name;

  const coverImage = cover ? (
    <MediaImage
      src={cover}
      alt={`${title} cover`}
      fill
      priority={priority}
      sizes="(min-width: 1280px) 17vw, (min-width: 768px) 26vw, 46vw"
      className="card-cover"
    />
  ) : null;

  return (
    <Link
      href={`/anime/${media.id}` as Route<string>}
      aria-label={`Open ${title}`}
      className="group block min-w-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
    >
      <div className="card-frame" style={!cover && color ? { backgroundColor: color } : undefined}>
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
            <span className="font-serif text-sm leading-tight text-paper/75">{title}</span>
          </div>
        )}

        <div className="card-scrim" />

        {/* CSS-only hover preview: no client JS per card. */}
        <div data-slot="card-preview" aria-hidden="true" className="card-preview">
          <p className="line-clamp-3 text-[0.875rem] leading-5 text-white/75">
            {synopsis ?? media.genres.slice(0, 3).join(" · ")}
          </p>
          {studio && (
            <p className="mt-2 font-mono text-[0.75rem] uppercase tracking-[0.12em] text-white/75">
              {studio}
            </p>
          )}
        </div>

        {rank !== undefined && rank <= 100 && (
          <span
            className={`pointer-events-none absolute left-2.5 top-2.5 rounded-[2px] bg-black/70 px-1.5 py-0.5 font-serif text-[0.9375rem] italic tabular-nums backdrop-blur-sm ${
              rank <= 3 ? "text-signal" : "text-white"
            }`}
          >
            {String(rank).padStart(2, "0")}
          </span>
        )}

        {score !== undefined && (
          <span className="pointer-events-none absolute right-2.5 top-2.5 rounded-[2px] bg-black/55 px-1.5 py-0.5 backdrop-blur-sm">
            <MediaScore score={score} className="text-[0.8125rem] font-medium text-white/90" />
          </span>
        )}

        {isReleasing && rank === undefined && (
          <span className="pointer-events-none absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-[2px] bg-signal px-1.5 py-0.5 font-mono text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-white">
            <span className="size-1 rounded-full bg-white" />
            Live
          </span>
        )}
      </div>

      <div className="pt-2.5">
        <p className="card-title">{title}</p>
        <p className="card-meta">
          {[media.format ? formatFormat(media.format) : null, media.seasonYear]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
    </Link>
  );
}

export function MediaCardSkeleton() {
  return (
    <div className="min-w-0">
      <div className="card-frame">
        <div className="shimmer absolute inset-0" />
      </div>
      <div className="space-y-2 pt-2.5">
        <div className="skeleton-line" />
        <div className="skeleton-line-sm" />
      </div>
    </div>
  );
}
