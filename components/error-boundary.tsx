"use client";

import { catchError, type ErrorInfo } from "next/error";
import { Button } from "@/components/ui/button";
import { AlertTriangleIcon } from "lucide-react";

function ErrorFallback(
  props: { title: string },
  { error, retry }: ErrorInfo
) {
  const err = error as Error;
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border-soft bg-surface-2/30 p-8 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangleIcon className="size-5 text-destructive" />
      </div>
      <h2 className="text-lg font-semibold">{props.title}</h2>
      <p className="max-w-sm text-sm text-muted-foreground">{err.message}</p>
      <Button onClick={() => retry()} variant="outline" size="sm">
        Try again
      </Button>
    </div>
  );
}

export const ErrorBoundary = catchError(ErrorFallback);
