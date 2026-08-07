"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { localDateStr } from "@/features/anime/lib/media-helpers";

export function AiringDaySync({ urlDay, serverDay }: { urlDay: string; serverDay: string }) {
  const router = useRouter();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    if (urlDay !== serverDay) return;
    const localToday = localDateStr();
    if (localToday !== serverDay) {
      done.current = true;
      router.replace(`/airing?day=${localToday}`, { scroll: false });
    }
  }, [urlDay, serverDay, router]);

  return null;
}
