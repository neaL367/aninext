"use client";

import Image from "next/image";
import { ClockIcon, PlayCircleIcon } from "lucide-react";
import { StreamingService } from "@/components/shared/streaming-service";
import type { AiringScheduleItem } from "@/lib/anilist/types";
import {
  formatLocalTime,
  formatRelativeAiringTime,
} from "@/lib/anilist/utils/datetime";
import { formatDisplayTitle } from "@/lib/anilist/utils/format";
import { excerptSynopsis, formatCountdownShort } from "@/lib/anilist/utils/tooltip";
import { getStreamingLinks } from "@/lib/anilist/utils/streaming";
import { cn } from "@/lib/utils";

type AiringItemTooltipContentProps = {
  item: AiringScheduleItem;
};

export function AiringItemTooltipContent({ item }: AiringItemTooltipContentProps) {
  const media = item.media;
  const title = media ? formatDisplayTitle(media.title) : "—";
  const cover = media?.coverImage?.large ?? media?.coverImage?.medium;
  const streaming = getStreamingLinks(media?.externalLinks ?? null);
  const synopsis = excerptSynopsis(media?.description);
  const totalEpisodes = media?.episodes ?? null;
  const episodeProgress =
    totalEpisodes && totalEpisodes > 0
      ? Math.min(100, Math.round((item.episode / totalEpisodes) * 100))
      : null;

  return (
    <div className="flex w-full flex-col gap-2.5 p-3">
      <p className="line-clamp-2 text-sm font-semibold leading-snug text-popover-foreground">
        {title}
      </p>

      <div className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <PlayCircleIcon className="size-4 text-primary" />
            Episode {item.episode}
            {totalEpisodes && totalEpisodes > 0 ? (
              <span className="font-normal text-muted-foreground">
                of {totalEpisodes}
              </span>
            ) : null}
          </div>
          <span className="text-xs font-medium tabular-nums text-primary">
            {formatCountdownShort(item.timeUntilAiring)}
          </span>
        </div>

        {episodeProgress !== null ? (
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
                className="h-full rounded-full bg-primary"
              style={{ width: `${episodeProgress}%` }}
            />
          </div>
        ) : null}

        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <ClockIcon className="size-3.5 shrink-0" />
          <span className="font-medium tabular-nums text-foreground">
            {formatLocalTime(item.airingAt)}
          </span>
          <span aria-hidden>·</span>
          <span>{formatRelativeAiringTime(item.airingAt)}</span>
        </div>
      </div>

      <div className="flex gap-2.5">
        {cover ? (
          <div
            className="relative size-16 shrink-0 overflow-hidden rounded-md border border-border bg-muted"
            style={{
              backgroundColor: media?.coverImage?.color ?? undefined,
            }}
          >
            <Image
              src={cover}
              alt=""
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
        ) : null}

        {synopsis ? (
          <p className="line-clamp-4 min-w-0 flex-1 text-xs leading-relaxed text-muted-foreground">
            {synopsis}
          </p>
        ) : null}
      </div>

      {streaming.length > 0 ? (
        <div
          className={cn(
            "flex flex-col gap-2",
            synopsis ? "border-t border-border pt-2" : ""
          )}
        >
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Watch on
          </p>
          <div className="flex flex-wrap gap-2">
            {streaming.slice(0, 4).map((link) => (
              <StreamingService
                key={link.site}
                site={link.site}
                url={link.url}
                size="sm"
                linked={false}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
