"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[55vh] w-full max-w-xl flex-col items-center justify-center gap-5 px-6 text-center">
      <p className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-signal">Error</p>
      <h1 className="display text-5xl sm:text-6xl">Something broke</h1>
      <p className="max-w-sm text-sm leading-6 text-muted-foreground">
        The data source did not respond. Try again in a moment.
      </p>
      {error.digest && (
        <p className="font-mono text-[0.55rem] uppercase tracking-[0.16em] text-muted-foreground/60">
          Ref {error.digest}
        </p>
      )}
      <button
        type="button"
        onClick={() => reset()}
        className="mt-2 border-b border-border-soft pb-1 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-foreground transition-colors hover:border-signal hover:text-signal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
      >
        Try again
      </button>
    </div>
  );
}
