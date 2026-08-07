"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export function LocalTime({
  timestamp,
  format = "time",
  className,
}: {
  timestamp: number;
  format?: "time" | "date-time";
  className?: string;
}) {
  const [label, setLabel] = useState("--:--");

  useEffect(() => {
    const options: Intl.DateTimeFormatOptions =
      format === "time"
        ? { hour: "2-digit", minute: "2-digit" }
        : { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" };
    setLabel(new Intl.DateTimeFormat("en-US", options).format(new Date(timestamp * 1000)));
  }, [format, timestamp]);

  return (
    <time dateTime={new Date(timestamp * 1000).toISOString()} className={cn(className)}>
      {label}
    </time>
  );
}
