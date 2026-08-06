"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { localDateStr } from "@/features/anime/lib/media-helpers";

export function AiringDefaultDaySync({ day }: { day?: string }) {
  const router = useRouter();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    if (day) return;
    done.current = true;
    router.replace(`/airing?day=${localDateStr()}`);
  }, [day, router]);

  return null;
}
