"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { localDateStr } from "@/features/anime/lib/media-helpers";

export function AiringDefaultDaySync() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    if (searchParams.get("day")) return;
    done.current = true;
    router.replace(`/airing?day=${localDateStr()}`);
  }, [searchParams, router]);

  return null;
}
