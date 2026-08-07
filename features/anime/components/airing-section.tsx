import { io } from "next/cache";

import { getAiringWeek } from "@/features/anime/anime-queries";

import { AiringHomeSection } from "./airing-home-section";

export async function AiringSection() {
  await io();
  // eslint-disable-next-line react-hooks/purity -- streaming region, time-of-request is intended
  const now = Math.floor(Date.now() / 1000);
  const start = now - 43200;
  const end = now + 129600;
  const schedules = await getAiringWeek(start, end);
  return <AiringHomeSection schedules={schedules} />;
}
