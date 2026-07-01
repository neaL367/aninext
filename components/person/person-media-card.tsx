import { CompactMediaTooltipCard } from "@/components/shared/compact-media-tooltip-card";
import type { MediaCardGrid, MediaType } from "@/lib/anilist/domain/types";

type PersonMediaCardProps = {
  media: MediaCardGrid & { type?: MediaType | null };
  role: string | null | undefined;
  className?: string;
};

export function PersonMediaCard({ media, role, className }: PersonMediaCardProps) {
  return (
    <CompactMediaTooltipCard media={media} badgeLabel={role?.trim() || "—"} className={className} />
  );
}
