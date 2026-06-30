"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { memo } from "react";
import { AiringItemTooltipContent } from "@/components/airing/airing-item-tooltip-content";
import { AiringCountdown } from "@/components/shared/countdown";
import { MediaTooltip, AIRING_TOOLTIP_WIDTH } from "@/components/shared/media-tooltip";
import { ProgressiveImage } from "@/components/shared/progressive-image";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import type { AiringScheduleItem } from "@/lib/anilist/types";
import { coverCardImageUrl } from "@/lib/anilist/utils/image-urls";
import {
  AIRING_ITEM_COVER_CLASS,
  AIRING_ITEM_COVER_IMAGE_CLASS,
} from "@/lib/ui/airing-item-cover";
import { formatDisplayTitle } from "@/lib/anilist/utils/format";
import { formatMediaFormat } from "@/lib/anilist/utils/labels";
import { saveDetailReturnFromCurrentPage } from "@/lib/navigation/detail-return";
import { cn } from "@/lib/utils";

const AIRING_BADGE_CLASS = "h-auto px-1.5 py-0.5 text-[10px] font-normal";

type AiringItemCardProps = {
  item: AiringScheduleItem;
  className?: string;
};

export const AiringItemCard = memo(function AiringItemCard({ item, className }: AiringItemCardProps) {
  const media = item.media;
  const title = media ? formatDisplayTitle(media.title) : "—";
  const coverUrl = coverCardImageUrl(media?.coverImage ?? null);
  const animeId = media?.id ?? 0;
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();

  const handleNavigateToDetail = () => {
    saveDetailReturnFromCurrentPage(pathname, searchParams.toString());
  };

  const card = (
    <article
      className={cn(
        "flex items-start gap-3 rounded-md border border-border bg-card p-3",
        className
      )}
    >
      <Link
        href={`/anime/${animeId}`}
        prefetch
        className={AIRING_ITEM_COVER_CLASS}
        onClick={handleNavigateToDetail}
      >
        {coverUrl ? (
          <ProgressiveImage
            sources={[coverUrl]}
            alt=""
            fill
            className={AIRING_ITEM_COVER_IMAGE_CLASS}
            sizes="80px"
            loading="lazy"
          />
        ) : null}
      </Link>

      <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-1">
            <Badge
              variant="outline"
              className={cn(AIRING_BADGE_CLASS, "tabular-nums")}
            >
              Ep {item.episode}
            </Badge>
            {media?.format ? (
              <Badge variant="outline" className={AIRING_BADGE_CLASS}>
                {formatMediaFormat(media.format)}
              </Badge>
            ) : null}
            <StatusBadge
              status={media?.status ?? null}
              className={cn(AIRING_BADGE_CLASS, "text-[9px]")}
            />
          </div>

          <Link
            href={`/anime/${animeId}`}
            prefetch
            className="line-clamp-2 text-sm font-medium leading-snug underline-offset-2 hover:underline"
            onClick={handleNavigateToDetail}
          >
            {title}
          </Link>
        </div>

        <AiringCountdown
          airingAt={item.airingAt}
          timeUntilAiring={item.timeUntilAiring}
        />
      </div>
    </article>
  );

  return (
    <MediaTooltip>
      <MediaTooltip.Trigger>{card}</MediaTooltip.Trigger>
      <MediaTooltip.Content className={AIRING_TOOLTIP_WIDTH}>
        <AiringItemTooltipContent item={item} />
      </MediaTooltip.Content>
    </MediaTooltip>
  );
});
