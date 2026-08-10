"use client";

import { useEffect, useState } from "react";

import { isValidAiringOffset } from "@/features/anime/lib/airing";
import { cn } from "@/lib/utils";

/**
 * Formats a Unix-seconds timestamp for display.
 *
 * By default it renders in the browser's own timezone. Pass `offsetMinutes`
 * (minutes east of UTC) when the surrounding data was fetched for a specific
 * timezone — e.g. the /airing schedule is fetched for the visitor's day as
 * defined by the `?offset=` URL param, so display must follow that offset
 * rather than the browser's ambient timezone (they can differ for shared
 * links), otherwise rows can appear on the wrong date.
 *
 * Both the label and the dateTime attribute are set after mount only: the
 * timestamp can come from a live clock (e.g. useNow), whose value differs
 * between server render and client hydration. Rendering the attribute at
 * render time would produce a hydration mismatch, so SSR output stays
 * deterministic (no dateTime, "--:--") and is patched in the effect.
 */
export function LocalTime({
  timestamp,
  format = "time",
  offsetMinutes,
  className,
}: {
  timestamp: number;
  format?: "time" | "date-time";
  offsetMinutes?: number;
  className?: string;
}) {
  "use memo";
  const [label, setLabel] = useState("--:--");
  const [dateTime, setDateTime] = useState<string | undefined>(undefined);

  useEffect(() => {
    const options: Intl.DateTimeFormatOptions =
      format === "time"
        ? { hour: "2-digit", minute: "2-digit" }
        : { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" };

    const hasOffset = typeof offsetMinutes === "number" && isValidAiringOffset(offsetMinutes);
    if (hasOffset) {
      // Wall-clock in the offset's timezone: shift the instant so the offset
      // becomes UTC, then format as UTC.
      const shifted = new Date((timestamp + offsetMinutes * 60) * 1000);
      const utcOptions: Intl.DateTimeFormatOptions = { ...options, timeZone: "UTC" };
      setLabel(new Intl.DateTimeFormat("en-US", utcOptions).format(shifted));
    } else {
      setLabel(new Intl.DateTimeFormat("en-US", options).format(new Date(timestamp * 1000)));
    }
    setDateTime(new Date(timestamp * 1000).toISOString());
  }, [format, timestamp, offsetMinutes]);

  return (
    <time dateTime={dateTime} className={cn(className)}>
      {label}
    </time>
  );
}
