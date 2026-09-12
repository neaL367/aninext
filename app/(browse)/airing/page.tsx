import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { parseAiringOffset, parseAiringParams } from "@/features/anime/lib/airing";
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
// renders.
export const instant = false;

export default async function AiringPage({ searchParams }: PageProps<"/airing">) {
  await connection();
  const sp = await searchParams;
  const cookieStore = await cookies();
  const cookieOffset = cookieStore.get("tz_offset")?.value;
  const { day, offsetMinutes } = parseAiringParams(sp);
  const resolvedOffset =
    offsetMinutes ?? (cookieOffset ? parseAiringOffset(cookieOffset) : undefined);
  const target = day ?? localDateStr();
  redirect(
    (resolvedOffset === undefined
      ? `/airing/${target}`
      : `/airing/${target}?offset=${resolvedOffset}`) as Route,
  );
}
