"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { getCurrentSeason } from "@/features/anime/lib/season";

export function SeasonalSync({
  urlSeason,
  urlYear,
  serverSeason,
  serverYear,
}: {
  urlSeason?: string;
  urlYear?: string;
  serverSeason: string;
  serverYear: number;
}) {
  const router = useRouter();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    if (urlSeason !== serverSeason || urlYear !== String(serverYear)) return;
    const local = getCurrentSeason();
    if (local.season !== serverSeason || local.seasonYear !== serverYear) {
      done.current = true;
      const params = new URLSearchParams(window.location.search);
      params.set("season", local.season);
      params.set("year", String(local.seasonYear));
      router.replace(`/anime/seasonal?${params.toString()}`, { scroll: false });
    }
  }, [urlSeason, urlYear, serverSeason, serverYear, router]);

  return null;
}
