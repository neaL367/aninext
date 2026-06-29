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
  const banner = media?.bannerImage ?? null;
  const streaming = getStreamingLinks(media?.externalLinks ?? null);
  const synopsis = excerptSynopsis(media?.description);
  const totalEpisodes = media?.episodes ?? null;
  const episodeProgress =
    totalEpisodes && totalEpisodes > 0
      ? Math.min(100, Math.round((item.episode / totalEpisodes) * 100))
      : null;

  return (
    <div className="flex w-full flex-col overflow-hidden">
      <div
        className="relative h-36 w-full shrink-0 overflow-hidden"
        style={{ backgroundColor: media?.coverImage?.color ?? "var(--muted)" }}
      >
        {banner ? (
          <Image
            src={banner}
            alt=""
            fill
            className="object-cover object-top"
            sizes="384px"
          />
        ) : cover ? (
          <Image
            src={cover}
            alt=""
            fill
            className="object-cover object-top opacity-90"
            sizes="384px"
          />
        ) : null}
        <div
          className="absolute inset-0 bg-linear-to-t from-popover via-popover/50 to-transparent"
          aria-hidden
        />
        <p className="absolute inset-x-0 bottom-0 line-clamp-2 px-4 pb-3 text-base font-semibold leading-snug text-popover-foreground">
          {title}
        </p>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-3.5 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <PlayCircleIcon className="size-4 text-primary" />
              Episode {item.episode}
              {totalEpisodes && totalEpisodes > 0 ? (
                <span className="font-normal text-muted-foreground">
                  of {totalEpisodes}
                </span>
              ) : null}
            </div>
            <span className="text-sm font-medium tabular-nums text-primary">
              {formatCountdownShort(item.timeUntilAiring)}
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

          <div className="mt-2.5 flex items-center gap-2 text-sm text-muted-foreground">
            <ClockIcon className="size-4 shrink-0" />
            <span className="font-medium tabular-nums text-foreground">
              {formatLocalTime(item.airingAt)}
            </span>
            <span aria-hidden>·</span>
            <span>{formatRelativeAiringTime(item.airingAt)}</span>
          </div>
        </div>

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
                  key={link.site}
                  site={link.site}
                  url={link.url}
                  size="sm"
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
