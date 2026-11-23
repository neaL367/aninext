"use client";

import { Suspense, use } from "react";
import { browser } from "react-dom";

import { isValidAiringOffset } from "@/features/anime/lib/airing";
import { cn } from "@/lib/utils";

type Format = "time" | "date-time";

function formatLabel(timestamp: number, format: Format, offsetMinutes?: number): string {
  const options: Intl.DateTimeFormatOptions =
    format === "time"
      ? { hour: "2-digit", minute: "2-digit", hour12: false, hourCycle: "h23" }
      : {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          hourCycle: "h23",
        };

  if (typeof offsetMinutes === "number" && isValidAiringOffset(offsetMinutes)) {
    // Wall-clock in the offset's timezone: shift the instant so the offset
    // becomes UTC, then format as UTC.
    const shifted = new Date((timestamp + offsetMinutes * 60) * 1000);
    return new Intl.DateTimeFormat("en-US", { ...options, timeZone: "UTC" }).format(shifted);
  }
  return new Intl.DateTimeFormat("en-US", options).format(new Date(timestamp * 1000));
}

function BrowserTime({
  timestamp,
  format,
  offsetMinutes,
  className,
}: {
  timestamp: number;
  format: Format;
  offsetMinutes?: number;
  className?: string;
}) {
  // The value depends on the visitor's timezone and on a live clock, neither of
  // which exists on the server. Suspending during server rendering keeps the
  // shell deterministic and lets the browser paint the real time on its first
  // render — no Effect, no post-hydration state update.
  use(browser("Timestamps are formatted in the visitor's timezone."));

  return (
    <time dateTime={new Date(timestamp * 1000).toISOString()} className={cn(className)}>
      {formatLabel(timestamp, format, offsetMinutes)}
    </time>
  );
}

export function LocalTime({
  timestamp,
  format = "time",
  offsetMinutes,
  className,
}: {
  timestamp: number;
  format?: Format;
  offsetMinutes?: number;
  className?: string;
}) {
  "use memo";
  return (
    <Suspense fallback={<time className={cn(className)}>--:--</time>}>
      <BrowserTime
        timestamp={timestamp}
        format={format}
        offsetMinutes={offsetMinutes}
        className={className}
      />
    </Suspense>
  );
}
