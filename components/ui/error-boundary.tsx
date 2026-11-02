"use client";

import { catchError, type ErrorInfo } from "next/error";
import { useEffect, useState } from "react";

import { AniListError } from "@/lib/anilist-errors";

const KIND_COPY: Record<AniListError["kind"], { title: string; body: string }> = {
  rate_limited: {
    title: "Rate limited",
    body: "Too many requests. Retrying shortly.",
  },
  outage: {
    title: "Source unavailable",
    body: "AniList is down right now. Try again in a moment.",
  },
  circuit_open: {
    title: "Taking a pause",
    body: "AniList is cooling down after errors. Retrying shortly.",
  },
  graphql: {
    title: "Unexpected response",
    body: "The source returned something we could not read.",
  },
  network: {
    title: "Could not reach the source",
    body: "Check your connection and try again.",
  },
};

function RateLimitCountdown({ seconds, onTick }: { seconds: number; onTick: () => void }) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          clearInterval(timer);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (remaining === 0) onTick();
  }, [remaining, onTick]);

  if (remaining <= 0) return null;
  return (
    <p className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-muted-foreground">
      Retrying in {remaining}s
    </p>
  );
}

function ErrorFallback(props: { title: string }, { error, retry }: ErrorInfo) {
  const err = error as Error & { digest?: string };
  const anilistErr = err instanceof AniListError ? err : null;
  const copy = anilistErr ? KIND_COPY[anilistErr.kind] : null;

  const isMinifiedRscError =
    typeof err.message === "string" &&
    (err.message.includes("Minified React error #441") ||
      err.message.includes("react.dev/errors/441") ||
      err.message.includes("Server Components render"));

  const body =
    copy?.body ??
    (isMinifiedRscError
      ? "The source is temporarily unavailable. Try again shortly."
      : err.message || "An unexpected error occurred.");

  return (
    <div className="flex flex-col items-start gap-3 border border-border-soft p-6">
      <p className="font-mono text-[0.58rem] uppercase tracking-[0.2em] text-signal">Error</p>
      <h2 className="font-serif text-2xl leading-none tracking-[-0.03em]">
        {copy?.title ?? props.title}
      </h2>
      <p className="max-w-md text-sm leading-6 text-muted-foreground">{body}</p>
      {err.digest && (
        <p className="font-mono text-[0.55rem] uppercase tracking-[0.16em] text-muted-foreground/60">
          Ref {err.digest}
        </p>
      )}
      {anilistErr?.kind === "rate_limited" || anilistErr?.kind === "circuit_open" ? (
        <RateLimitCountdown
          seconds={Math.min(anilistErr.retryAfterSeconds ?? 30, 60)}
          onTick={() => retry()}
        />
      ) : (
        <button
          type="button"
          onClick={() => retry()}
          className="mt-1 border-b border-border-soft pb-1 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-foreground transition-colors hover:border-signal hover:text-signal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export const ErrorBoundary = catchError(ErrorFallback);
