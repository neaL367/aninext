"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function SeasonalDefaultSync({
  current,
}: {
  current: { season: string; seasonYear: number };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    const season = searchParams.get("season");
    const year = searchParams.get("year");
    if (season && year) return;
    done.current = true;
    const params = new URLSearchParams(searchParams);
    if (!season) params.set("season", current.season);
    if (!year) params.set("year", String(current.seasonYear));
    router.replace(`/anime/seasonal?${params.toString()}`);
  }, [searchParams, current, router]);

  return null;
}
