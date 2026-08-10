import { cn } from "@/lib/utils";

export function EpisodeProgress({
  episode,
  total,
  className,
  barClassName,
}: {
  episode: number;
  total?: number;
  className?: string;
  barClassName?: string;
}) {
  const pct = total ? Math.min(100, Math.round((episode / total) * 100)) : null;
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="shrink-0 font-mono text-xs font-semibold tracking-tight text-foreground">
        Ep {episode}
        {total ? <span className="text-muted-foreground"> / {total}</span> : null}
      </span>
      {pct !== null && (
        <span
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Episode ${episode} of ${total}`}
          className={cn(
            "h-1 w-full max-w-56 overflow-hidden rounded-full bg-surface-3",
            barClassName,
          )}
        >
          <span
            className="block h-full rounded-full bg-signal transition-[width] duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </span>
      )}
    </div>
  );
}
