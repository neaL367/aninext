import { scoreColor } from "@/features/anime/lib/score";
import { cn } from "@/lib/utils";

export function MediaScore({
  score,
  star = false,
  className,
}: {
  score?: number;
  star?: boolean;
  className?: string;
}) {
  if (score === undefined) return null;

  return (
    <span className={cn("font-mono font-semibold tabular-nums", scoreColor(score), className)}>
      {star && "★ "}
      {(score / 10).toFixed(1)}
    </span>
  );
}
