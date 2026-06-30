import type { MediaStatus } from "@/lib/anilist/domain/types";
import { formatMediaStatus } from "@/lib/anilist/display/labels";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  status: MediaStatus | null | undefined;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  if (!status) {
    return null;
  }

  return (
    <Badge variant="outline" className={cn("bg-background/95 font-normal", className)}>
      {formatMediaStatus(status)}
    </Badge>
  );
}
