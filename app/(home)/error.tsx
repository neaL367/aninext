"use client";

import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { SectionError } from "@/components/shared/section-error";
import { Button } from "@/components/ui/button";

export default function HomeError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageContainer className="flex flex-col gap-6 py-10">
      <SectionError
        title="Home failed to load"
        message="Carousel data could not be loaded. You can retry or browse anime directly."
      />
      <div className="flex flex-wrap gap-2">
        <Button onClick={reset} className="min-h-11">
          Try again
        </Button>
        <Button
          variant="outline"
          className="min-h-11"
          render={<Link href="/anime" />}
          nativeButton={false}
        >
          Browse anime
        </Button>
      </div>
    </PageContainer>
  );
}
