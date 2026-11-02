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
      <span className="shrink-0 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-foreground/80">
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
          className={cn("h-px w-full max-w-56 overflow-hidden bg-border-soft", barClassName)}
        >
          <span
            className="block h-full bg-signal transition-[width] duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </span>
      )}
    </div>
  );
}
