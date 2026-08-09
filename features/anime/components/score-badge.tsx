import { StarIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function ScoreBadge({
  score,
  suffix,
  className,
}: {
  score?: number;
  suffix?: string;
  className?: string;
}) {
  "use memo";
  if (!score) return null;
  return (
    <span className={cn("inline-flex items-center gap-1 font-bold text-foreground", className)}>
      <StarIcon className="size-3.5 fill-signal text-signal" />
      <span className="font-mono tabular-nums">{(score / 10).toFixed(1)}</span>
      {suffix && <span className="font-normal text-muted-foreground">{suffix}</span>}
    </span>
  );
}
