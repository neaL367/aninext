import { CalendarIcon, FilmIcon, PlayIcon, TvIcon } from "lucide-react";

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ImageWithLoading } from "@/components/ui/image-with-loading";
import { formatFormat, formatStatus, getMediaTitle } from "@/features/anime/lib/media-helpers";
import { scoreColor } from "@/features/anime/lib/score";
import { cn } from "@/lib/utils";

import type { Media } from "@/features/anime/types/anime";

export function AnimePreviewCard({ media, children }: { media: Media; children: React.ReactNode }) {
  const title = getMediaTitle(media);
  const color = media.coverImage.color;
  const studio = media.studios?.nodes[0]?.name;
  const description = media.description?.replace(/<[^>]*>/g, "").trim();

  return (
    <HoverCard>
      <HoverCardTrigger>{children}</HoverCardTrigger>
      <HoverCardContent
        side="right"
        align="start"
        sideOffset={8}
        className="w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-none border border-border-soft bg-card p-0 shadow-2xl ring-1 ring-foreground/10"
      >
        {media.bannerImage ? (
          <div
            className="relative h-32 w-full overflow-hidden"
            style={color ? { backgroundColor: color } : undefined}
          >
            <ImageWithLoading
              src={media.bannerImage}
              alt=""
              fill
              sizes="352px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
            {media.averageScore && (
              <div className="absolute right-3 top-3 flex items-center gap-1 rounded-sm bg-black/70 px-2 py-1 backdrop-blur-sm">
                <span
                  className={cn(
                    "font-mono text-xs font-bold tabular-nums",
                    scoreColor(media.averageScore),
                  )}
                >
                  ★ {(media.averageScore / 10).toFixed(1)}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div
            className="relative h-16 w-full"
            style={
              color ? { background: `linear-gradient(135deg, ${color}40, var(--card))` } : undefined
            }
          >
            {media.averageScore && (
              <div className="absolute right-3 top-3 flex items-center gap-1 rounded-sm bg-black/70 px-2 py-1 backdrop-blur-sm">
                <span
                  className={cn(
                    "font-mono text-xs font-bold tabular-nums",
                    scoreColor(media.averageScore),
                  )}
                >
                  ★ {(media.averageScore / 10).toFixed(1)}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3 p-4">
          <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight">
            {title}
          </h3>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
            {media.format && (
              <span className="inline-flex items-center gap-1 rounded-sm border border-border-soft bg-surface-1 px-1.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-wide text-muted-foreground">
                <TvIcon className="size-3" />
                {formatFormat(media.format)}
              </span>
            )}
            {media.episodes && (
              <span className="inline-flex items-center gap-1 rounded-sm border border-border-soft bg-surface-1 px-1.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-wide text-muted-foreground">
                <FilmIcon className="size-3" />
                {media.episodes} ep
              </span>
            )}
            {media.status && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-wide",
                  media.status === "RELEASING"
                    ? "border-live-badge/30 bg-live-badge/10 text-live-badge"
                    : "border-border-soft bg-surface-1 text-muted-foreground",
                )}
              >
                <PlayIcon className="size-3" />
                {formatStatus(media.status)}
              </span>
            )}
            {media.seasonYear && (
              <span className="inline-flex items-center gap-1 rounded-sm border border-border-soft bg-surface-1 px-1.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-wide text-muted-foreground">
                <CalendarIcon className="size-3" />
                {media.season} {media.seasonYear}
              </span>
            )}
          </div>

          {description && (
            <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}

          {media.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {media.genres.slice(0, 4).map((genre) => (
                <span
                  key={genre}
                  className="rounded-sm border border-border-soft bg-surface-1/50 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          {studio && (
            <div className="border-t border-border-soft pt-3">
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.08em] text-muted-foreground">
                Studio <span className="text-foreground">{studio}</span>
              </p>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
