"use client";

import { useCallback, useState } from "react";
import { PlayCircleIcon } from "lucide-react";
import { StreamingService } from "@/components/shared/streaming-service";
import {
  formatCountdownRemaining,
  useCountdownRemaining,
} from "@/components/shared/countdown";
import { MediaCardTooltipBodySkeleton } from "@/components/shared/media-card-tooltip-skeleton";
import { MediaCardTooltipHero } from "@/components/shared/media-card-tooltip-hero";
import type { AiringScheduleItem } from "@/lib/anilist/types";
import { formatDisplayTitle } from "@/lib/anilist/utils/format";
import { excerptSynopsis } from "@/lib/anilist/utils/tooltip";
import { getStreamingLinks } from "@/lib/anilist/utils/streaming";
import { cn } from "@/lib/utils";

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
              <span className="font-normal text-muted-foreground">
                {" "}
                of {totalEpisodes}
              </span>
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

            {streaming.length > 0 ? (
              <div
                className={cn(
                  "flex flex-col gap-2.5",
                  synopsis ? "border-t border-border pt-3" : ""
                )}
              >
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Watch on
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {streaming.slice(0, 5).map((link) => (
                    <StreamingService
                      key={`${link.site}-${link.url}`}
                      site={link.site}
                      url={link.url}
                      size="sm"
                    />
                  ))}
                </div>
              </div>
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
