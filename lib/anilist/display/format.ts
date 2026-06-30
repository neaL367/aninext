import { normalizeAniListDescription } from "@/lib/anilist/display/parse-anilist-description";

export const MISSING_VALUE = "—";

export function formatValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return MISSING_VALUE;
  }
  return String(value);
}

export function formatScore(score: number | null | undefined): string {
  if (score === null || score === undefined) {
    return MISSING_VALUE;
  }
  return `${score}%`;
}

export function formatPopularityPercent(
  popularity: number | null | undefined,
  maxPopularity: number
): string {
  if (
    popularity === null ||
    popularity === undefined ||
    maxPopularity <= 0
  ) {
    return MISSING_VALUE;
  }
  return `${Math.round((popularity / maxPopularity) * 100)}%`;
}

export function formatEpisodeCount(episodes: number | null | undefined): string {
  if (episodes === null || episodes === undefined) {
    return MISSING_VALUE;
  }
  return episodes === 0 ? "?" : String(episodes);
}

export function formatChapterCount(chapters: number | null | undefined): string {
  if (chapters === null || chapters === undefined) {
    return MISSING_VALUE;
  }
  return chapters === 0 ? "?" : String(chapters);
}

export function formatVolumeCount(volumes: number | null | undefined): string {
  if (volumes === null || volumes === undefined) {
    return MISSING_VALUE;
  }
  return volumes === 0 ? "?" : String(volumes);
}

export function formatPersonName(
  name:
    | {
        full?: string | null;
        native?: string | null;
        userPreferred?: string | null;
      }
    | null
    | undefined
): string {
  if (!name) {
    return MISSING_VALUE;
  }
  return name.userPreferred ?? name.full ?? name.native ?? MISSING_VALUE;
}

export function formatDisplayTitle(
  title: {
    english: string | null;
    romaji: string | null;
    native: string | null;
  } | null | undefined
): string {
  if (!title) {
    return MISSING_VALUE;
  }
  return title.english ?? title.romaji ?? title.native ?? MISSING_VALUE;
}

/** Romaji / native line for detail headers — skips values that duplicate the primary title. */
export function formatAlternateTitles(
  title: {
    english: string | null;
    romaji: string | null;
    native: string | null;
  } | null | undefined,
  primary: string
): string | null {
  if (!title) return null;

  const normalize = (value: string) => value.trim().toLowerCase();
  const primaryKey = normalize(primary);

  const parts = [title.romaji, title.native]
    .filter((value): value is string => Boolean(value?.trim()))
    .filter((value, index, array) => {
      const key = normalize(value);
      if (key === primaryKey) return false;
      return array.findIndex((other) => normalize(other) === key) === index;
    });

  return parts.length ? parts.join(" · ") : null;
}

export function stripHtml(html: string | null | undefined): string {
  if (!html) {
    return MISSING_VALUE;
  }

  return normalizeAniListDescription(html)
    .replace(/__([^_]+?)__/g, "$1")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .trim();
}

export function formatAiringTime(timestamp: number): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(timestamp * 1000));
}

export function formatFuzzyDate(
  date: {
    year: number | null;
    month: number | null;
    day: number | null;
  } | null
): string {
  if (!date?.year) {
    return MISSING_VALUE;
  }
  const parts = [date.year];
  if (date.month) {
    parts.unshift(date.month);
  }
  if (date.day) {
    parts.unshift(date.day);
  }
  return parts.join("/");
}

export function applyPopularityPercents<T extends { popularity: number | null }>(
  items: readonly T[]
): (T & { popularityPercent: number | null })[] {
  const max = Math.max(
    0,
    ...items.map((item) => item.popularity ?? 0)
  );
  return items.map((item) => ({
    ...item,
    popularityPercent:
      item.popularity !== null && max > 0
        ? Math.round((item.popularity / max) * 100)
        : null,
  }));
}
