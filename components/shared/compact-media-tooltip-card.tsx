"use client";

import { AnimeCardTooltipContent } from "@/components/anime/anime-card-tooltip-content";
import { MediaTooltip } from "@/components/shared/media-tooltip";
import {
  CompactMediaCard,
  type CompactMediaCardProps,
} from "@/components/shared/compact-media-card";
import type { MediaCard } from "@/lib/anilist/domain/types";

/** Compact cover card with lazy-loaded hover tooltip (detail relations, person credits). */
export function CompactMediaTooltipCard(props: CompactMediaCardProps) {
  "use memo";

  return (
    <MediaTooltip>
      <MediaTooltip.Trigger>
        <div className="h-full">
          <CompactMediaCard {...props} />
        </div>
      </MediaTooltip.Trigger>
      <MediaTooltip.Content>
        <AnimeCardTooltipContent media={props.media as MediaCard} />
      </MediaTooltip.Content>
    </MediaTooltip>
  );
}
