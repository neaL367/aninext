"use client";

import { memo } from "react";
import { AnimeCardTooltipContent } from "@/components/anime/anime-card-tooltip-content";
import {
  AnimeCardArticle,
  type AnimeCardMedia,
} from "@/components/anime/anime-card-parts";
import { MediaTooltip } from "@/components/shared/media-tooltip";

type AnimeTooltipCardProps = {
  media: AnimeCardMedia;
  layout: "carousel" | "browse";
  showCountdown?: boolean;
  priority?: boolean;
  className?: string;
};

export const AnimeTooltipCard = memo(function AnimeTooltipCard({
  media,
  layout,
  showCountdown = false,
  priority = false,
  className,
}: AnimeTooltipCardProps) {
  return (
    <MediaTooltip>
      <MediaTooltip.Trigger>
        <div className="h-full">
          <AnimeCardArticle
            media={media}
            layout={layout}
            showCountdown={showCountdown}
            priority={priority}
            className={className}
          />
        </div>
      </MediaTooltip.Trigger>
      <MediaTooltip.Content>
        <AnimeCardTooltipContent media={media} />
      </MediaTooltip.Content>
    </MediaTooltip>
  );
});
