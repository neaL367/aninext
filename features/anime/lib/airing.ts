import { localDateStr } from "./media-helpers";

/** Add days to a YYYY-MM-DD string (UTC-safe, tz-independent). */
export function addDays(day: string, days: number): string {
  const [y, m, d] = day.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(
    date.getUTCDate(),
  ).padStart(2, "0")}`;
}

/**
 * The visitor's local "today" as YYYY-MM-DD, derived from their UTC offset
 * (which the client sends). Falls back to the server's own today when no
 * offset is available yet (first paint before AiringDayDefault hydrates).
 */
export function visitorToday(offsetMinutes?: number): string {
  if (typeof offsetMinutes !== "number" || !Number.isFinite(offsetMinutes)) {
    return localDateStr();
  }
  const localEpoch = Date.now() + offsetMinutes * 60_000;
  const d = new Date(localEpoch);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(
    d.getUTCDate(),
  ).padStart(2, "0")}`;
}

/** Local calendar date (YYYY-MM-DD) for an epoch second in the visitor's tz. */
export function dateStrFromEpoch(epochSeconds: number, offsetMinutes: number): string {
  const d = new Date((epochSeconds + offsetMinutes * 60) * 1000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(
    d.getUTCDate(),
  ).padStart(2, "0")}`;
}

/**
 * Maps a `YYYY-MM-DD` calendar day to a [start, end) Unix-second window.
 *
 * `offsetMinutes` (minutes east of UTC, sent by the client) anchors the window
 * to the *visitor's* local midnight instead of the server process's timezone —
 * the server runs UTC in production, so parsing `${day}T00:00:00` as local time
 * previously fetched the wrong day for every non-UTC visitor.
 */
export function getAiringDayBounds(
  day: string,
  offsetMinutes?: number,
): { start: number; end: number } | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;

  const [year, month, dayOfMonth] = day.split("-").map(Number);
  const parsed = new Date(`${day}T00:00:00`);
  if (!Number.isFinite(parsed.getTime())) return null;

  let start: number;
  if (typeof offsetMinutes === "number" && Number.isFinite(offsetMinutes)) {
    // Visitor-local midnight expressed in UTC: UTC(y,m,d) is that day's 00:00 UTC;
    // shifting by the visitor's offset yields their local midnight as an epoch.
    const utcMidnight = Date.UTC(year, month - 1, dayOfMonth);
    const probe = new Date(utcMidnight);
    // Reject overflow-normalized dates (e.g. 2026-02-30 → Mar 2).
    if (
      probe.getUTCFullYear() !== year ||
      probe.getUTCMonth() !== month - 1 ||
      probe.getUTCDate() !== dayOfMonth
    ) {
      return null;
    }
    start = Math.floor(utcMidnight / 1000) - offsetMinutes * 60;
  } else {
    // No client offset yet (first paint before AiringDayDefault hydrates):
    // fall back to server-local midnight, matching the pre-fix behavior.
    if (localDateStr(parsed) !== day) return null;
    start = Math.floor(parsed.getTime() / 1000);
  }

  if (!Number.isSafeInteger(start)) return null;
  return { start, end: start + 86400 };
}

/**
 * Resolve /airing searchParams to plain feature values at the page boundary.
 * `day` is the visitor's local calendar day; `offsetMinutes` (east of UTC)
 * defines the timezone the day was fetched in.
 */
export function parseAiringParams(sp: { [key: string]: string | string[] | undefined }): {
  day: string | undefined;
  offsetMinutes: number | undefined;
} {
  return {
    day: typeof sp.day === "string" ? sp.day : undefined,
    offsetMinutes:
      typeof sp.offset === "string" && sp.offset.trim() !== "" && Number.isFinite(Number(sp.offset))
        ? Number(sp.offset)
        : undefined,
  };
}
