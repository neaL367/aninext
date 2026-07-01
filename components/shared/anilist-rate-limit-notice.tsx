"use client";

import { useRouter } from "next/navigation";
import { RetryError } from "@/components/shared/retry-error";

type AniListRateLimitNoticeProps = {
  title: string;
  variant?: "page" | "section";
};

export function AniListRateLimitNotice({
  title,
  variant = "section",
}: AniListRateLimitNoticeProps) {
  const router = useRouter();

  return (
    <RetryError
      title={title}
      message="AniList is busy. Please wait a moment and try again."
      reset={() => router.refresh()}
      variant={variant}
    />
  );
}
