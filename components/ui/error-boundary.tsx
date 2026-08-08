"use client";

import { AlertTriangleIcon } from "lucide-react";
import { catchError, type ErrorInfo } from "next/error";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { AniListError } from "@/lib/anilist-errors";

const KIND_COPY: Record<AniListError["kind"], { title: string; body: string }> = {
  rate_limited: {
    title: "AniList rate limit hit",
    body: "Too many requests. Retrying automatically.",
  },
  outage: {
    title: "AniList is temporarily unavailable",
    body: "The data source is down right now. Try again in a moment.",
  },
  circuit_open: {
    title: "Service temporarily unavailable",
    body: "AniList is taking a brief pause due to high error rates. Retrying automatically shortly.",
  },
  graphql: {
    title: "Something went wrong",
    body: "The data source returned an unexpected response.",
  },
  network: {
    title: "Failed to load",
    body: "Could not reach the data source. Check your connection.",
  },
};

function RateLimitCountdown({ seconds, onTick }: { seconds: number; onTick: () => void }) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(timer);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (remaining === 0) onTick();
  }, [remaining, onTick]);

  if (remaining <= 0) return null;
  return <p className="font-mono text-xs text-muted-foreground">Retrying in {remaining}s</p>;
}

function ErrorFallback(props: { title: string }, { error, retry }: ErrorInfo) {
  const err = error as Error;
  const anilistErr = err instanceof AniListError ? err : null;
  const copy = anilistErr ? KIND_COPY[anilistErr.kind] : null;

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border-soft bg-surface-2/30 p-8 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangleIcon className="size-5 text-destructive" />
      </div>
      <h2 className="text-lg font-semibold">{copy?.title ?? props.title}</h2>
      <p className="max-w-sm text-sm text-muted-foreground">{copy?.body ?? err.message}</p>
      {anilistErr?.kind === "rate_limited" || anilistErr?.kind === "circuit_open" ? (
        <RateLimitCountdown
          seconds={Math.min(anilistErr.retryAfterSeconds ?? 30, 60)}
          onTick={() => retry()}
        />
      ) : (
        <Button onClick={() => retry()} variant="outline" size="sm">
          Try again
        </Button>
      )}
    </div>
  );
}

export const ErrorBoundary = catchError(ErrorFallback);
