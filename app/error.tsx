"use client";

import { AlertTriangleIcon } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

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
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangleIcon className="size-5 text-destructive" />
      </div>
      <h1 className="text-lg font-semibold">Something went wrong</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        This section failed to load. Try again — if it keeps failing, the data source may be
        temporarily unavailable.
      </p>
      {error.digest && (
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-muted-foreground/60">
          Reference {error.digest}
        </p>
      )}
      <Button onClick={() => reset()} variant="outline" size="sm">
        Try again
      </Button>
    </div>
  );
}
