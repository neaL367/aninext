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
        "border border-border/60 bg-background/95 font-semibold tabular-nums",
        className
      )}
    >
      #{rank}
    </Badge>
  );
}
