import type { MediaSeason } from "@/lib/anilist/domain/types";

export type AnimeSeason = {
  season: MediaSeason;
  year: number;
};

const SEASONS: readonly MediaSeason[] = [
  "WINTER",
  "SPRING",
  "SUMMER",
  "FALL",
];

export function getSeasonFromMonth(month: number): MediaSeason {
  if (month <= 3) return "WINTER";
  if (month <= 6) return "SPRING";
  if (month <= 9) return "SUMMER";
  return "FALL";
}

export function getCurrentAnimeSeason(
  date: Date = new Date()
): AnimeSeason {
  return {
    season: getSeasonFromMonth(date.getMonth() + 1),
    year: date.getFullYear(),
  };
}

export function getNextAnimeSeason(
  date: Date = new Date()
): AnimeSeason {
  const current = getCurrentAnimeSeason(date);
  const index = SEASONS.indexOf(current.season);
  const nextIndex = (index + 1) % SEASONS.length;
  const year = nextIndex === 0 ? current.year + 1 : current.year;
  return { season: SEASONS[nextIndex]!, year };
}

export function formatSeasonLabel(season: AnimeSeason): string {
  const label = season.season.charAt(0) + season.season.slice(1).toLowerCase();
  return `${label} ${season.year}`;
}

export const WEEKDAY_LABELS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export function getWeekdayIndex(date: Date): number {
  const day = date.getDay();
  return day === 0 ? 6 : day - 1;
}

export function getWeekRange(date: Date = new Date()): {
  start: number;
  end: number;
} {
  const startDate = new Date(date);
  const day = startDate.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(startDate.getDate() + diff);

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7);

  return {
    start: Math.floor(startDate.getTime() / 1000),
    end: Math.floor(endDate.getTime() / 1000),
  };
}
