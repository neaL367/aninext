import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type RankingBadgeProps = {
  rank: number;
  className?: string;
};

export function RankingBadge({ rank, className }: RankingBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "absolute left-1.5 top-1.5 z-10 border border-border bg-background/95 font-medium tabular-nums",
        className
      )}
    >
      #{rank}
    </Badge>
  );
}
