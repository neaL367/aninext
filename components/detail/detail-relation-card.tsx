import { CompactMediaTooltipCard } from "@/components/shared/compact-media-tooltip-card";
import type { MediaCardGrid, MediaRelation, MediaType } from "@/lib/anilist/domain/types";
import { formatMediaRelationType } from "@/lib/anilist/display/relation-labels";

export type DetailRelationMedia = MediaCardGrid & {
  type?: MediaType | null;
};

export type DetailRelationItem = {
  relationType: MediaRelation;
  media: DetailRelationMedia;
};

type DetailRelationCardProps = {
  item: DetailRelationItem;
  className?: string;
};

export function DetailRelationCard({ item, className }: DetailRelationCardProps) {
  const { relationType, media } = item;

  return (
    <CompactMediaTooltipCard
      media={media}
      badgeLabel={formatMediaRelationType(relationType)}
      className={className}
    />
  );
}
