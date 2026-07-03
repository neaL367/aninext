"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname, useSearchParams } from "next/navigation";
import { StarIcon } from "lucide-react";
import { Countdown } from "@/components/shared/countdown";
import { ProgressiveImage } from "@/components/shared/progressive-image";
import { RankingBadge } from "@/components/shared/ranking-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import type { MediaCard } from "@/lib/anilist/domain/types";
import { coverCardImageUrl } from "@/lib/anilist/display/image-urls";
import { formatDisplayTitle, formatEpisodeCount, formatScore } from "@/lib/anilist/display/format";
import { formatDuration, formatMediaFormat, formatSeasonYear } from "@/lib/anilist/display/labels";
import {
  ANIME_BROWSE_CARD_COVER_CLASS,
  ANIME_CARD_COMPACT_COVER_CLASS,
  ANIME_CARD_COVER_CLASS,
  ANIME_CARD_COVER_GRADIENT_BOTTOM_CLASS,
  ANIME_CARD_COVER_GRADIENT_TOP_CLASS,
  ANIME_CARD_COVER_IMAGE_CLASS,
} from "@/lib/styles/anime-card-cover";
import {
  ANIME_BROWSE_CARD_BODY_CLASS,
  ANIME_CARD_BODY_CLASS,
  ANIME_CARD_BODY_WITH_COUNTDOWN_CLASS,
  ANIME_CARD_LINK_CLASS,
  ANIME_CARD_META_CLASS,
  ANIME_CARD_ROOT_CLASS,
  ANIME_CARD_STATS_CLASS,
  ANIME_CARD_TITLE_CLASS,
} from "@/lib/styles/anime-grid-layout";
import { persistBrowseRestoreSnapshot } from "@/lib/navigation/browse-restore";
import { saveDetailReturnFromCurrentPage } from "@/lib/navigation/detail-return";
import { getMediaDetailHref } from "@/lib/anilist/display/media-links";
import { cn } from "@/lib/utils";

export type AnimeCardMedia = MediaCard & {
  popularityPercent?: number | null;
  rank?: number;
};

export type AnimeCardLayout = "carousel" | "browse" | "compact";

const COVER_BADGE_CLASS =
  "h-auto min-h-6 rounded-md border-border/60 bg-background/95 px-2 py-1 text-xs leading-none shadow-sm";

const COVER_CLASS_BY_LAYOUT: Record<AnimeCardLayout, string> = {
  carousel: ANIME_CARD_COVER_CLASS,
  browse: ANIME_BROWSE_CARD_COVER_CLASS,
  compact: ANIME_CARD_COMPACT_COVER_CLASS,
};

const BODY_CLASS_BY_LAYOUT: Record<AnimeCardLayout, string> = {
  carousel: ANIME_CARD_BODY_CLASS,
  browse: ANIME_BROWSE_CARD_BODY_CLASS,
  compact: ANIME_CARD_BODY_CLASS,
};

const IMAGE_SIZES_BY_LAYOUT: Record<AnimeCardLayout, string> = {
  carousel: "(max-width: 640px) 33vw, 180px",
  browse: "(max-width: 640px) 50vw, 240px",
  compact: "100px",
};

type AnimeCardArticleProps = {
  media: AnimeCardMedia;
  layout: AnimeCardLayout;
  priority?: boolean;
  showCountdown?: boolean;
  className?: string;
};

export function AnimeCardArticle({
  media,
  layout,
  priority = false,
  showCountdown = false,
  className,
}: AnimeCardArticleProps) {
  "use memo";

  const title = formatDisplayTitle(media.title);
  const coverUrl = coverCardImageUrl(media.coverImage);
  const score = formatScore(media.averageScore);
  const seasonYear = formatSeasonYear(media.season ?? null, media.seasonYear ?? null);
  const format = formatMediaFormat(media.format);
  const primaryGenre = media.genres?.[0];
  const hasRank = media.rank != null && media.rank > 0;
  const isCompact = layout === "compact";
  const showScore = score !== "—" && !isCompact;
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();

  const { href, external } = getMediaDetailHref(media.id, media.type, title);

  const handleNavigateToDetail = () => {
    if (!external) {
      if (pathname === "/anime") {
        persistBrowseRestoreSnapshot();
      }
      saveDetailReturnFromCurrentPage(pathname, searchParams.toString());
    }
  };

  const linkClassName = ANIME_CARD_LINK_CLASS;
  const cardContent = (
    <>
      <div
        className={COVER_CLASS_BY_LAYOUT[layout]}
        style={media.coverImage?.color ? { backgroundColor: media.coverImage.color } : undefined}
      >
        {coverUrl ? (
          <ProgressiveImage
            sources={[coverUrl]}
            alt={title}
            fill
            sizes={IMAGE_SIZES_BY_LAYOUT[layout]}
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
                  "inline-flex shrink-0 items-center gap-0.5 font-medium tabular-nums",
                )}
              >
                <StarIcon className="size-3 fill-amber-400 text-amber-400" />
                {score}
              </span>
            ) : null}
          </div>

          {hasRank && media.status ? (
            <div className="flex justify-start">
              <StatusBadge status={media.status} className={cn(COVER_BADGE_CLASS, "font-normal")} />
            </div>
          ) : null}
        </div>
      </div>

      <div
        className={cn(
          showCountdown ? ANIME_CARD_BODY_WITH_COUNTDOWN_CLASS : BODY_CLASS_BY_LAYOUT[layout],
          isCompact && "gap-1.5 p-2.5",
        )}
      >
        <h3
          className={cn(
            isCompact ? "line-clamp-2 text-xs font-medium leading-snug" : ANIME_CARD_TITLE_CLASS,
          )}
        >
          {title}
        </h3>

        {!isCompact ? (
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
    </>
  );

  return (
    <article className={cn(ANIME_CARD_ROOT_CLASS, className)}>
      {external ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClassName}
          aria-label={`${title} on AniList`}
        >
          {cardContent}
        </a>
      ) : (
        <Link
          href={href as Route}
          prefetch={layout !== "browse"}
          className={linkClassName}
          onClick={handleNavigateToDetail}
        >
          {cardContent}
        </Link>
      )}
    </article>
  );
}
