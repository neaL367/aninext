"use client";

import Link from "next/link";
import { memo } from "react";
import { StarIcon } from "lucide-react";
import { AnimeCardTooltipContent } from "@/components/anime/anime-card-tooltip-content";
import { MediaTooltip } from "@/components/shared/media-tooltip";
import { RankingBadge } from "@/components/shared/ranking-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { Countdown } from "@/components/shared/countdown";
import { ProgressiveImage } from "@/components/shared/progressive-image";
import type { MediaCard } from "@/lib/anilist/types";
import {
  coverCardImageUrl,
} from "@/lib/anilist/utils/image-urls";
import {
  ANIME_BROWSE_CARD_COVER_CLASS,
  ANIME_CARD_COMPACT_COVER_CLASS,
  ANIME_CARD_COVER_CLASS,
  ANIME_CARD_COVER_GRADIENT_BOTTOM_CLASS,
  ANIME_CARD_COVER_GRADIENT_TOP_CLASS,
  ANIME_CARD_COVER_IMAGE_CLASS,
} from "@/lib/ui/anime-card-cover";
import {
  ANIME_BROWSE_CARD_BODY_CLASS,
  ANIME_CARD_BODY_CLASS,
  ANIME_CARD_BODY_WITH_COUNTDOWN_CLASS,
  ANIME_CARD_LINK_CLASS,
  ANIME_CARD_META_CLASS,
  ANIME_CARD_ROOT_CLASS,
  ANIME_CARD_STATS_CLASS,
  ANIME_CARD_TITLE_CLASS,
} from "@/lib/ui/anime-grid-layout";
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
  variant?: "carousel" | "browse";
  priority?: boolean;
  className?: string;
};

const COVER_BADGE_CLASS =
  "h-auto min-h-6 rounded-md border-border/60 bg-background/95 px-2 py-1 text-xs leading-none shadow-sm";

export const AnimeCard = memo(function AnimeCard({
  media,
  showCountdown = false,
  showTooltip = true,
  compact = false,
  variant = "carousel",
  priority = false,
  className,
}: AnimeCardProps) {
  const isBrowse = variant === "browse";
  const title = formatDisplayTitle(media.title);
  const coverUrl = coverCardImageUrl(media.coverImage);
  const score = formatScore(media.averageScore);
  const seasonYear = formatSeasonYear(media.season ?? null, media.seasonYear ?? null);
  const format = formatMediaFormat(media.format);
  const primaryGenre = media.genres?.[0];
  const hasRank = media.rank != null && media.rank > 0;
  const showScore = score !== "—" && !compact;

  const card = (
    <article className={cn(ANIME_CARD_ROOT_CLASS, className)}>
      <Link
        href={`/anime/${media.id}`}
        prefetch
        className={ANIME_CARD_LINK_CLASS}
      >
        <div
            className={cn(
              compact
                ? ANIME_CARD_COMPACT_COVER_CLASS
                : isBrowse
                  ? ANIME_BROWSE_CARD_COVER_CLASS
                  : ANIME_CARD_COVER_CLASS
            )}
            style={
              media.coverImage?.color
                ? { backgroundColor: media.coverImage.color }
                : undefined
            }
          >
            {coverUrl ? (
              <ProgressiveImage
                sources={[coverUrl]}
                alt={title}
                fill
                sizes={
                  compact
                    ? "100px"
                    : isBrowse
                      ? "(max-width: 640px) 50vw, 240px"
                      : "(max-width: 640px) 33vw, 180px"
                }
                className={ANIME_CARD_COVER_IMAGE_CLASS}
                priority={priority}
              />
            ) : null}

            <div className={ANIME_CARD_COVER_GRADIENT_TOP_CLASS} aria-hidden />
            <div className={ANIME_CARD_COVER_GRADIENT_BOTTOM_CLASS} aria-hidden />

            <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-2">
              <div className="flex items-start justify-between gap-1">
                <div className="flex min-w-0 flex-col items-start gap-1">
                  {hasRank ? (
                    <RankingBadge rank={media.rank!} className={COVER_BADGE_CLASS} />
                  ) : (
                    <StatusBadge
                      status={media.status}
                      className={cn(COVER_BADGE_CLASS, "font-normal")}
                    />
                  )}
                </div>

                {showScore ? (
                  <span
                    className={cn(
                      COVER_BADGE_CLASS,
                      "inline-flex shrink-0 items-center gap-0.5 font-medium tabular-nums"
                    )}
                  >
                    <StarIcon className="size-3 fill-amber-400 text-amber-400" />
                    {score}
                  </span>
                ) : null}
              </div>

              {hasRank && media.status ? (
                <div className="flex justify-start">
                  <StatusBadge
                    status={media.status}
                    className={cn(COVER_BADGE_CLASS, "font-normal")}
                  />
                </div>
              ) : null}
            </div>
          </div>

        <div
          className={cn(
            showCountdown && !compact
              ? ANIME_CARD_BODY_WITH_COUNTDOWN_CLASS
              : isBrowse
                ? ANIME_BROWSE_CARD_BODY_CLASS
                : ANIME_CARD_BODY_CLASS,
            compact && "gap-1.5 p-2.5"
          )}
        >
          <h3
            className={cn(
              compact ? "line-clamp-2 text-xs font-medium leading-snug" : ANIME_CARD_TITLE_CLASS
            )}
          >
            {title}
          </h3>

          {!compact ? (
            <>
              <p className={ANIME_CARD_META_CLASS}>
                {[
                  primaryGenre,
                  format !== "—" ? format : null,
                  seasonYear !== "—" ? seasonYear : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>

              <p className={ANIME_CARD_STATS_CLASS}>
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
      <div className="h-full">{card}</div>
    </MediaTooltip>
  );
});
