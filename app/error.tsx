"use client";

import Link from "next/link";
import { useEffect } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";

export default function RootError({
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
    <PageContainer className="flex flex-col items-start gap-4 py-16">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="max-w-prose text-muted-foreground">
        An unexpected error occurred. You can try again or return to the
        homepage.
      </p>
      <div className="flex gap-2">
        <Button onClick={reset} className="min-h-11">
          Try again
        </Button>
        <Button
          variant="outline"
          className="min-h-11"
          render={<Link href="/" />}
          nativeButton={false}
        >
          Go home
        </Button>
      </div>
    </PageContainer>
  );
}
