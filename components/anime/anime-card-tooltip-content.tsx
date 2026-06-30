"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { CalendarClockIcon, StarIcon, UsersIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MediaCardTooltipBodySkeleton } from "@/components/shared/media-card-tooltip-skeleton";
import {
  formatCountdownRemaining,
  useCountdownRemaining,
} from "@/components/shared/countdown";
import { MediaCardTooltipHero } from "@/components/shared/media-card-tooltip-hero";
import { mediaCardTooltipOptions } from "@/lib/anilist/tooltip-query-options";
import type { MediaCard } from "@/lib/anilist/types";
import { hasMediaCardTooltipFields } from "@/lib/anilist/types";
import { useMediaTooltipOpen } from "@/components/shared/media-tooltip";
import { formatDisplayTitle, formatScore } from "@/lib/anilist/utils/format";
import {
  excerptSynopsis,
  formatPopularityCount,
  getMainStudioName,
  getTopTags,
} from "@/lib/anilist/utils/tooltip";

type AnimeCardTooltipContentProps = {
  media: MediaCard & { rank?: number };
};

function NextAiringCountdown({
  airingAt,
  timeUntilAiring,
  episode,
}: {
  airingAt: number;
  timeUntilAiring: number;
  episode: number;
}) {
  "use memo";

  const remaining = useCountdownRemaining(airingAt, timeUntilAiring);

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm">
      <CalendarClockIcon className="size-4 shrink-0 text-muted-foreground" />
      <p className="font-medium text-foreground">
        Ep {episode} in {formatCountdownRemaining(remaining)}
      </p>
    </div>
  );
}

function AnimeCardTooltipLoaded({
  mergedMedia,
  tooltipFailed,
}: {
  mergedMedia: MediaCard & { rank?: number };
  tooltipFailed: boolean;
}) {
  "use memo";

  const [bannerReady, setBannerReady] = useState(!mergedMedia.bannerImage);
  const handleBannerLoad = useCallback(() => setBannerReady(true), []);

  const title = formatDisplayTitle(mergedMedia.title);
  const score = formatScore(mergedMedia.averageScore);
  const synopsis = excerptSynopsis(mergedMedia.description);
  const studio = getMainStudioName(mergedMedia.studios);
  const popularity = formatPopularityCount(mergedMedia.popularity);
  const tags = getTopTags(mergedMedia.tags);
  const nextAiring = mergedMedia.nextAiringEpisode;

  return (
    <div className="flex min-w-0 w-full flex-col overflow-hidden">
      <MediaCardTooltipHero
        title={title}
        placeholderColor={mergedMedia.coverImage?.color}
        bannerImage={mergedMedia.bannerImage}
        sizes="448px"
        onBannerLoad={handleBannerLoad}
      />

      {!bannerReady ? (
        <MediaCardTooltipBodySkeleton />
      ) : (
        <div className="flex min-w-0 flex-col gap-3 p-4">
          {synopsis ? (
            <p className="line-clamp-6 text-sm leading-relaxed text-muted-foreground">
              {synopsis}
            </p>
          ) : (
            <p className="text-sm italic text-muted-foreground">
              {tooltipFailed ? "Details unavailable." : "No synopsis available."}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border pt-3 text-sm text-muted-foreground">
            {studio ? (
              <span className="inline-flex items-center gap-1.5">
                <UsersIcon className="size-3.5 shrink-0" />
                {studio}
              </span>
            ) : null}
            {score !== "—" ? (
              <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                <StarIcon className="size-3.5 fill-amber-400 text-amber-400" />
                {score}
              </span>
            ) : null}
            {popularity ? (
              <span className="tabular-nums">{popularity} users</span>
            ) : null}
          </div>

          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="px-2 py-0 text-xs font-normal"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null}

          {nextAiring ? (
            <NextAiringCountdown
              airingAt={nextAiring.airingAt}
              timeUntilAiring={nextAiring.timeUntilAiring}
              episode={nextAiring.episode}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}

export function AnimeCardTooltipContent({ media }: AnimeCardTooltipContentProps) {
  "use memo";

  const tooltipOpen = useMediaTooltipOpen();
  const hasEmbeddedTooltipFields = hasMediaCardTooltipFields(media);

  const {
    data: tooltipOverlay,
    isPending,
    isError,
  } = useQuery({
    ...mediaCardTooltipOptions(media.id),
    enabled: tooltipOpen && !hasEmbeddedTooltipFields,
  });

  const mergedMedia = useMemo(() => {
    if (hasEmbeddedTooltipFields) {
      return media;
    }
    if (tooltipOverlay) {
      return { ...media, ...tooltipOverlay };
    }
    return media;
  }, [hasEmbeddedTooltipFields, media, tooltipOverlay]);

  const hasTooltipFields =
    hasEmbeddedTooltipFields || hasMediaCardTooltipFields(mergedMedia);
  const isLoading = !hasEmbeddedTooltipFields && isPending;

  if (isLoading || !hasTooltipFields) {
    return (
      <div className="flex min-w-0 w-full flex-col overflow-hidden">
        <MediaCardTooltipHero
          title={formatDisplayTitle(mergedMedia.title)}
          placeholderColor={mergedMedia.coverImage?.color}
          bannerImage={mergedMedia.bannerImage}
          sizes="448px"
        />
        <MediaCardTooltipBodySkeleton />
      </div>
    );
  }

  return (
    <AnimeCardTooltipLoaded
      key={`${media.id}-${mergedMedia.bannerImage ?? "none"}`}
      mergedMedia={mergedMedia}
      tooltipFailed={isError}
    />
  );
}
