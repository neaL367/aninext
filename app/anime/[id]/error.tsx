"use client";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";

export default function AnimeDetailError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <PageContainer className="flex flex-col gap-4 py-16">
      <h1 className="text-2xl font-semibold">Unable to load anime details</h1>
      <Button onClick={reset} className="min-h-11 w-fit">
        Retry
      </Button>
    </PageContainer>
  );
}
