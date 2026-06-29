import Image from "next/image";
import Link from "next/link";
import { StarIcon } from "lucide-react";
import { AnimeCardTooltipContent } from "@/components/anime/anime-card-tooltip-content";
import { MediaTooltip } from "@/components/shared/media-tooltip";
import { RankingBadge } from "@/components/shared/ranking-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { Countdown } from "@/components/shared/countdown";
import type { MediaCard } from "@/lib/anilist/types";
import {
  formatDisplayTitle,
  formatEpisodeCount,
  formatScore,
} from "@/lib/anilist/utils/format";
import {
  formatDuration,
  formatMediaFormat,
  formatSeasonYear,
} from "@/lib/anilist/utils/labels";
import { cn } from "@/lib/utils";

type AnimeCardProps = {
  media: MediaCard & { popularityPercent?: number | null; rank?: number };
  showCountdown?: boolean;
  showTooltip?: boolean;
  compact?: boolean;
  className?: string;
};

export function AnimeCard({
  media,
  showCountdown = false,
  showTooltip = true,
  compact = false,
  className,
}: AnimeCardProps) {
  const title = formatDisplayTitle(media.title);
  const coverUrl = media.coverImage?.large ?? media.coverImage?.medium;
  const score = formatScore(media.averageScore);
  const seasonYear = formatSeasonYear(media.season ?? null, media.seasonYear ?? null);
  const format = formatMediaFormat(media.format);
  const primaryGenre = media.genres?.[0];

  const card = (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-md border border-border/70 bg-card",
        className
      )}
    >
      <Link href={`/anime/${media.id}`} prefetch className="flex h-full flex-col">
        <div
          className={cn(
            "relative w-full shrink-0 overflow-hidden bg-muted",
            compact
              ? "aspect-[2/3] max-h-[11rem]"
              : "aspect-[2/3] max-h-[13.5rem] sm:max-h-[15rem] lg:max-h-[16rem]"
          )}
          style={{
            backgroundColor: media.coverImage?.color ?? "var(--muted)",
          }}
        >
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={title}
              fill
              sizes={compact ? "100px" : "(max-width: 640px) 30vw, 140px"}
              className="object-cover"
            />
          ) : null}

          {media.rank != null && media.rank > 0 ? (
            <RankingBadge rank={media.rank} />
          ) : null}

          <div
            className={cn(
              "absolute z-10",
              media.rank != null && media.rank > 0
                ? "bottom-1 left-1"
                : "top-1 left-1"
            )}
          >
            <StatusBadge
              status={media.status}
              className="border-border/50 bg-background/90 px-1 py-0 text-[9px] backdrop-blur-sm"
            />
          </div>

          {score !== "—" && !compact ? (
            <div className="absolute top-1 right-1 z-10 inline-flex items-center gap-0.5 rounded border border-border/50 bg-background/90 px-1 py-0 text-[11px] font-medium backdrop-blur-sm tabular-nums">
              <StarIcon className="size-3 fill-amber-400 text-amber-400" />
              {score}
            </div>
          ) : null}
        </div>

        <div
          className={cn(
            "flex flex-1 flex-col",
            compact ? "gap-1 p-2" : "gap-1.5 p-2.5"
          )}
        >
          <h3
            className={cn(
              "line-clamp-2 font-medium leading-snug text-foreground",
              compact ? "text-xs" : "text-sm"
            )}
          >
            {title}
          </h3>

          {!compact ? (
            <>
              <p className="line-clamp-1 text-xs text-muted-foreground">
                {[
                  primaryGenre,
                  format !== "—" ? format : null,
                  seasonYear !== "—" ? seasonYear : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>

              <p className="mt-auto text-xs tabular-nums text-muted-foreground">
                {formatEpisodeCount(media.episodes)} eps
                {media.duration ? (
                  <>
                    <span aria-hidden className="mx-1 text-border">
                      ·
                    </span>
                    {formatDuration(media.duration)}
                  </>
                ) : null}
              </p>
            </>
          ) : null}

          {showCountdown && media.nextAiringEpisode ? (
            <Countdown
              airingAt={media.nextAiringEpisode.airingAt}
              timeUntilAiring={media.nextAiringEpisode.timeUntilAiring}
            />
          ) : null}
        </div>
      </Link>
    </article>
  );

  if (!showTooltip) {
    return card;
  }

  return (
    <MediaTooltip content={<AnimeCardTooltipContent media={media} />}>
      {card}
    </MediaTooltip>
  );
}
