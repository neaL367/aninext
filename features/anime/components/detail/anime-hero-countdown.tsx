"use client";

export function AiringCountdown({ airingAt, episode }: { airingAt: number; episode: number }) {
  const now = Date.now();
  const diff = airingAt * 1000 - now;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);

  return (
    <div className="border-t border-live-badge/50 pt-4">
      <p className="eyebrow flex items-center gap-2 text-live-badge"><span className="size-1.5 animate-pulse rounded-full bg-live-badge" /> Next episode</p>
      <p className="mt-2 font-mono text-sm tabular-nums text-foreground">Episode {episode} <span className="text-muted-foreground">/ {days > 0 ? `${days}d ` : ""}{hours}h remaining</span></p>
    </div>
  );
}
