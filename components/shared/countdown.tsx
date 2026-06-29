"use client";

import { useEffect, useState } from "react";
import { formatAiringTime } from "@/lib/anilist/utils/format";

type CountdownProps = {
  airingAt: number;
  timeUntilAiring: number;
};

function formatCountdown(seconds: number): string {
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

export function Countdown({ airingAt, timeUntilAiring }: CountdownProps) {
  const [remaining, setRemaining] = useState(timeUntilAiring);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRemaining(Math.max(0, Math.floor(airingAt - Date.now() / 1000)));
    }, 30_000);
    return () => window.clearInterval(interval);
  }, [airingAt]);

  return (
    <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
      <span className="tabular-nums">{formatAiringTime(airingAt)}</span>
      <span className="font-medium tabular-nums text-foreground">
        {formatCountdown(remaining)}
      </span>
    </div>
  );
}
