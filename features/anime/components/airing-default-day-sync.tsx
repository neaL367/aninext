"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export function AiringDefaultDaySync({ day }: { day: string }) {
  const router = useRouter();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    const localToday = new Date().toISOString().split("T")[0];
    if (day !== localToday) {
      done.current = true;
      router.replace(`/airing?day=${localToday}`);
    }
  }, [day, router]);

  return null;
}
