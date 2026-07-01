"use client";

import { useEffect, useState } from "react";
import { formatLocalTime } from "@/lib/anilist/display/datetime";
import { formatAiringTime } from "@/lib/anilist/display/format";
import { cn } from "@/lib/utils";

type CountdownProps = {
  airingAt: number;
  timeUntilAiring: number;
  className?: string;
};

const TICK_MS = 30_000;
const subscribers = new Set<() => void>();
let tickerId: number | undefined;

export function formatCountdownRemaining(seconds: number): string {
  if (seconds <= 0) {
    return "Airing now";
  }
  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3_600);
  const minutes = Math.floor((seconds % 3_600) / 60);
  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function ensureTicker() {
  if (tickerId !== undefined || subscribers.size === 0) {
    return;
  }
  tickerId = window.setInterval(() => {
    for (const notify of subscribers) {
      notify();
    }
  }, TICK_MS);
}

function releaseTicker() {
  if (subscribers.size > 0 || tickerId === undefined) {
    return;
  }
  window.clearInterval(tickerId);
  tickerId = undefined;
}

export function useCountdownRemaining(airingAt: number, timeUntilAiring: number) {
  "use memo";

  const [remaining, setRemaining] = useState(timeUntilAiring);

  useEffect(() => {
    const update = () => {
      setRemaining(Math.max(0, Math.floor(airingAt - Date.now() / 1000)));
    };

    update();
    subscribers.add(update);
    ensureTicker();

    return () => {
      subscribers.delete(update);
      releaseTicker();
    };
  }, [airingAt]);

  return remaining;
}

/** Compact live countdown for airing schedule rows — countdown + local time only. */
export function AiringCountdown({ airingAt, timeUntilAiring, className }: CountdownProps) {
  "use memo";

  const remaining = useCountdownRemaining(airingAt, timeUntilAiring);

  return (
    <div className={cn("flex shrink-0 flex-col items-end gap-0.5 text-right", className)}>
      <span className="text-sm font-medium tabular-nums text-foreground">
        {formatCountdownRemaining(remaining)}
      </span>
      <time
        dateTime={new Date(airingAt * 1000).toISOString()}
        className="text-[11px] tabular-nums text-muted-foreground"
      >
        {formatLocalTime(airingAt)}
      </time>
    </div>
  );
}

/** Home carousel card — weekday time + live countdown. */
export function Countdown({ airingAt, timeUntilAiring, className }: CountdownProps) {
  "use memo";

  const remaining = useCountdownRemaining(airingAt, timeUntilAiring);

  return (
    <div className={cn("flex flex-col gap-0.5 text-xs text-muted-foreground", className)}>
      <span className="tabular-nums">{formatAiringTime(airingAt)}</span>
      <span className="font-medium tabular-nums text-foreground">
        {formatCountdownRemaining(remaining)}
      </span>
    </div>
  );
}
