"use client";

import { PageContainer } from "@/components/layout/page-container";
import { SectionError } from "@/components/shared/section-error";
import { Button } from "@/components/ui/button";

type RetryErrorProps = {
  title: string;
  message?: string;
  reset: () => void;
  variant?: "page" | "section";
};

export function RetryError({
  title,
  message,
  reset,
  variant = "section",
}: RetryErrorProps) {
  const content = (
    <>
      <SectionError title={title} message={message} />
      {variant === "page" ? (
        <Button onClick={reset} className="min-h-11 w-fit">
          Retry
        </Button>
      ) : (
        <button
          type="button"
          onClick={reset}
          className="text-sm font-medium text-foreground underline underline-offset-4"
        >
          Retry
        </button>
      )}
    </>
  );

  if (variant === "page") {
    return (
      <PageContainer className="flex flex-col gap-4 py-16">{content}</PageContainer>
    );
  }

  return <div className="flex flex-col gap-3">{content}</div>;
}
