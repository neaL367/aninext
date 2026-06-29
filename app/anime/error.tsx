"use client";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";

export default function AnimeError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <PageContainer className="flex flex-col gap-4 py-16">
      <h1 className="text-2xl font-semibold">Unable to load anime list</h1>
      <p className="text-muted-foreground">
        The anime listing failed to load. Please try again.
      </p>
      <Button onClick={reset} className="min-h-11 w-fit">
        Retry
      </Button>
    </PageContainer>
  );
}
