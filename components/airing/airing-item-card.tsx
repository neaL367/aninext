import Image from "next/image";
import Link from "next/link";
import { AiringItemTooltipContent } from "@/components/airing/airing-item-tooltip-content";
import { MediaTooltip } from "@/components/shared/media-tooltip";
import { StatusBadge } from "@/components/shared/status-badge";
import { StreamingService } from "@/components/shared/streaming-service";
import { Badge } from "@/components/ui/badge";
import type { AiringScheduleItem } from "@/lib/anilist/types";
import {
  formatLocalTime,
  formatRelativeAiringTime,
} from "@/lib/anilist/utils/datetime";
import { formatDisplayTitle } from "@/lib/anilist/utils/format";
import { formatMediaFormat } from "@/lib/anilist/utils/labels";
import { getStreamingLinks } from "@/lib/anilist/utils/streaming";
import { cn } from "@/lib/utils";

type AiringItemCardProps = {
  item: AiringScheduleItem;
  className?: string;
};

export function AiringItemCard({ item, className }: AiringItemCardProps) {
  const media = item.media;
  const title = media ? formatDisplayTitle(media.title) : "—";
  const cover = media?.coverImage?.medium ?? media?.coverImage?.large;
  const streaming = getStreamingLinks(media?.externalLinks ?? null);
  const animeId = media?.id ?? 0;

  const card = (
    <article
      className={cn(
        "flex gap-3 rounded-lg border border-border bg-card p-3",
        className
      )}
    >
      <Link
        href={`/anime/${animeId}`}
        className="relative w-11 shrink-0 overflow-hidden rounded-md border border-border sm:w-12"
        style={{
          aspectRatio: "2/3",
          backgroundColor: media?.coverImage?.color ?? "var(--muted)",
        }}
      >
        {cover ? (
          <Image src={cover} alt="" fill className="object-cover" sizes="48px" />
        ) : null}
      </Link>

      <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="outline" className="px-1.5 py-0 font-normal tabular-nums">
              Ep {item.episode}
            </Badge>
            {media?.format ? (
              <Badge variant="outline" className="px-1.5 py-0 font-normal">
                {formatMediaFormat(media.format)}
              </Badge>
            ) : null}
            <StatusBadge
              status={media?.status ?? null}
              className="px-1.5 py-0 text-[10px]"
            />
          </div>

          <Link
            href={`/anime/${animeId}`}
            className="line-clamp-2 text-sm font-medium leading-snug"
          >
            {title}
          </Link>

          {streaming.length ? (
            <div className="flex flex-wrap gap-2">
              {streaming.slice(0, 2).map((link) => (
                <StreamingService
                  key={link.site}
                  site={link.site}
                  url={link.url}
                  size="sm"
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-0.5 text-right">
          <time
            dateTime={new Date(item.airingAt * 1000).toISOString()}
            className="text-sm font-medium tabular-nums"
          >
            {formatLocalTime(item.airingAt)}
          </time>
          <p className="text-xs text-muted-foreground">
            {formatRelativeAiringTime(item.airingAt)}
          </p>
        </div>
      </div>
    </article>
  );

  return (
    <MediaTooltip content={<AiringItemTooltipContent item={item} />}>
      {card}
    </MediaTooltip>
  );
}
