"use client";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";

type RouteErrorProps = {
  title: string;
  message?: string;
  reset: () => void;
};

export function RouteError({ title, message, reset }: RouteErrorProps) {
  return (
    <PageContainer className="flex flex-col gap-4 py-16">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {message ? (
        <p className="text-muted-foreground">{message}</p>
      ) : null}
      <Button onClick={reset} className="min-h-11 w-fit">
        Retry
      </Button>
    </PageContainer>
  );
}
