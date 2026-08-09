import { localDateStr } from "@/features/anime/lib/media-helpers";

import { getAiringDay } from "../anime-queries";

import type { AiringScheduleNode } from "@/features/anime/types/anime";

export async function getAiringSchedule(day: string): Promise<AiringScheduleNode[]> {
  const bounds = getAiringDayBounds(day);
  if (!bounds) return [];

  return getAiringDay(day, bounds.start, bounds.end);
}

function getAiringDayBounds(day: string): { start: number; end: number } | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;

  const date = new Date(`${day}T00:00:00`);
  if (!Number.isFinite(date.getTime()) || localDateStr(date) !== day) return null;

  const start = Math.floor(date.getTime() / 1000);
  if (!Number.isSafeInteger(start)) return null;
  return { start, end: start + 86400 };
}

export { AiringTVGuide, AiringTVGuideSkeleton } from "./airing-tv-guide";
