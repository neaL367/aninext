import { redirect } from "next/navigation";

import { parseAiringParams } from "@/features/anime/lib/airing";
import { localDateStr } from "@/features/anime/lib/media-helpers";

import type { Metadata, Route } from "next";

export const metadata: Metadata = {
  title: "Airing schedule — AniNext",
  description: "See what anime is airing this week and plan your next watch.",
  alternates: { canonical: "/airing" },
};

// Bare /airing holds no content — it always redirects to a day path with a
// real HTTP 307. Legacy `?day=` URLs land on their clean `/airing/[day]`
// equivalent; anything else lands on today. Blocking (`instant = false`) is
// correct here: there is no shell worth streaming for a route that never
// renders. The client then corrects the day and offset to the visitor's
// timezone once (see AiringDayDefault).
export const instant = false;

export default async function AiringPage({ searchParams }: PageProps<"/airing">) {
  const sp = await searchParams;
  const { day, offsetMinutes } = parseAiringParams(sp);
  const target = day ?? localDateStr();
  redirect(
    (offsetMinutes === undefined ? `/airing/${target}` : `/airing/${target}?offset=${offsetMinutes}`) as Route,
  );
}
