"use client";

import { CalendarIcon, FilmIcon, PlayIcon, TvIcon } from "lucide-react";
import { useState } from "react";

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { MediaImage } from "@/components/ui/media-image";
import {
  formatFormat,
  formatStatus,
  getMediaTitle,
  stripHtml,
} from "@/features/anime/lib/media-helpers";
import { cn } from "@/lib/utils";

import { MediaScore } from "./media-score";

import type { Media } from "@/features/anime/types/anime";

export function AnimePreviewCard({
  media,
  children,
}: {
  media: Media;
  children: React.ReactElement;
}) {
  "use memo";
  const [open, setOpen] = useState(false);
  const title = getMediaTitle(media);
  const color = media.coverImage.color;
  const studio = media.studios?.nodes[0]?.name;
  const description = stripHtml(media.description);

  return (
    <HoverCard open={open} onOpenChange={setOpen}>
      <HoverCardTrigger render={children} />
      {open && (
        <HoverCardContent
          side="right"
          align="start"
          sideOffset={10}
          className="w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-md border border-border-soft bg-card/95 p-0 shadow-2xl backdrop-blur-xl ring-1 ring-foreground/10 z-50 animate-in fade-in-0 zoom-in-95 duration-200"
        >
          {media.bannerImage ? (
            <div
              className="relative h-36 w-full overflow-hidden bg-card"
              style={color ? { backgroundColor: color } : undefined}
            >
              <MediaImage
                src={media.bannerImage}
                alt=""
                fill
                unoptimized
                sizes="384px"
                className="object-cover transform-gpu"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
              {media.averageScore !== undefined && (
                <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-md bg-black/75 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-md border border-white/10 shadow-sm">
                  <MediaScore score={media.averageScore} star className="text-xs font-bold" />
                </div>
              )}
            </div>
          ) : (
            <div
              className="relative h-16 w-full"
              style={
                color
                  ? { background: `linear-gradient(135deg, ${color}40, var(--card))` }
                  : undefined
              }
            >
              {media.averageScore !== undefined && (
                <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-md bg-black/75 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-md border border-white/10 shadow-sm">
                  <MediaScore score={media.averageScore} star className="text-xs font-bold" />
                </div>
              )}
            </div>
          )}

          <div className="space-y-3.5 p-5">
            <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight text-foreground">
              {title}
            </h3>

            <div className="flex flex-wrap items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-wide">
              {media.format && (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-border-soft bg-surface-1 px-2 py-1 text-muted-foreground">
                  <TvIcon className="size-3 text-signal" />
                  {formatFormat(media.format)}
                </span>
              )}
              {media.episodes && (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-border-soft bg-surface-1 px-2 py-1 text-muted-foreground">
                  <FilmIcon className="size-3 text-signal" />
                  {media.episodes} ep
                </span>
              )}
              {media.status && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-semibold",
                    media.status === "RELEASING"
                      ? "border-live-badge/30 bg-live-badge/15 text-live-badge"
                      : "border-border-soft bg-surface-1 text-muted-foreground",
                  )}
                >
                  <PlayIcon className="size-3" />
                  {formatStatus(media.status)}
                </span>
              )}
              {media.seasonYear && (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-border-soft bg-surface-1 px-2 py-1 text-muted-foreground">
                  <CalendarIcon className="size-3 text-signal" />
                  {media.season} {media.seasonYear}
                </span>
              )}
            </div>

            {description && (
              <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground font-normal">
                {description}
              </p>
            )}

            {media.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {media.genres.slice(0, 4).map((genre) => (
                  <span
                    key={genre}
                    className="rounded-md border border-border-soft bg-surface-1/80 px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-wider text-muted-foreground"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {studio && (
              <div className="border-t border-border-soft pt-3">
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground">
                  Studio <span className="font-semibold text-foreground">{studio}</span>
                </p>
              </div>
            )}
          </div>
        </HoverCardContent>
      )}
    </HoverCard>
  );
}
