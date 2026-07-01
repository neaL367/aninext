"use client";

import { useCallback, useState } from "react";
import { PlayCircleIcon } from "lucide-react";
import { StreamingLinksGrid } from "@/components/shared/streaming-links-grid";
import { formatCountdownRemaining, useCountdownRemaining } from "@/components/shared/countdown";
import { MediaCardTooltipBodySkeleton } from "@/components/shared/media-card-tooltip-skeleton";
import { MediaTooltipGenreChips } from "@/components/shared/media-tooltip-genre-chips";
import { MediaCardTooltipHero } from "@/components/shared/media-card-tooltip-hero";
import type { AiringScheduleItem } from "@/lib/anilist/domain/types";
import { formatDisplayTitle } from "@/lib/anilist/display/format";
import { excerptSynopsis, getDisplayGenres } from "@/lib/anilist/display/tooltip";
import { getStreamingLinks } from "@/lib/anilist/display/streaming";

type AiringItemTooltipContentProps = {
  item: AiringScheduleItem;
};

function AiringEpisodeBlock({
  item,
  totalEpisodes,
}: {
  item: AiringScheduleItem;
  totalEpisodes: number | null;
}) {
  "use memo";

  const remaining = useCountdownRemaining(item.airingAt, item.timeUntilAiring);
  const episodeProgress =
    totalEpisodes && totalEpisodes > 0
      ? Math.min(100, Math.round((item.episode / totalEpisodes) * 100))
      : null;

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 px-3.5 py-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-foreground">
          <PlayCircleIcon className="size-4 shrink-0 text-primary" />
          <span className="min-w-0 truncate">
            Episode {item.episode}
            {totalEpisodes && totalEpisodes > 0 ? (
              <span className="font-normal text-muted-foreground"> of {totalEpisodes}</span>
            ) : null}
          </span>
        </div>
        <span className="shrink-0 text-sm font-medium tabular-nums text-primary">
          {formatCountdownRemaining(remaining)}
        </span>
      </div>

      {episodeProgress !== null ? (
        <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${episodeProgress}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}

function AiringItemTooltipBody({
  item,
  media,
  contentReady,
  onBannerLoad,
}: {
  item: AiringScheduleItem;
  media: NonNullable<AiringScheduleItem["media"]>;
  contentReady: boolean;
  onBannerLoad: () => void;
}) {
  "use memo";

  const title = formatDisplayTitle(media.title);
  const streaming = getStreamingLinks(media.externalLinks ?? null);
  const synopsis = excerptSynopsis(media.description);
  const totalEpisodes = media.episodes ?? null;
  const genres = getDisplayGenres(media.genres);
  const hasContentAboveStreaming = Boolean(synopsis || genres.length);

  return (
    <div className="flex min-w-0 w-full flex-col overflow-hidden">
      <MediaCardTooltipHero
        title={title}
        placeholderColor={media.coverImage?.color}
        bannerImage={media.bannerImage}
        sizes="384px"
        onBannerLoad={onBannerLoad}
      />

      <div className="flex min-w-0 flex-col gap-3 p-4">
        <AiringEpisodeBlock item={item} totalEpisodes={totalEpisodes} />

        {!contentReady ? (
          <MediaCardTooltipBodySkeleton lines={3} showTags={false} />
        ) : (
          <>
            {synopsis ? (
              <p className="line-clamp-5 text-sm leading-relaxed text-muted-foreground">
                {synopsis}
              </p>
            ) : null}

            <MediaTooltipGenreChips genres={media.genres} />

            {streaming.length > 0 ? (
              <StreamingLinksGrid
                links={streaming}
                limit={5}
                size="sm"
                className={hasContentAboveStreaming ? "border-t border-border pt-3" : undefined}
              />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

export function AiringItemTooltipContent({ item }: AiringItemTooltipContentProps) {
  "use memo";

  const media = item.media;
  const [contentReady, setContentReady] = useState(!media?.bannerImage);
  const handleBannerLoad = useCallback(() => setContentReady(true), []);

  if (!media) {
    return null;
  }

  return (
    <AiringItemTooltipBody
      item={item}
      media={media}
      contentReady={contentReady}
      onBannerLoad={handleBannerLoad}
    />
  );
}
