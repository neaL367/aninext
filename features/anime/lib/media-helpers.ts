import type {
  Media,
  MediaTitle,
  MediaCoverImage,
  MediaExternalLink,
} from "@/features/anime/types/anime";

export { formatFormat, formatStatus } from "./labels";

const STREAMING_SITES = [
  "crunchyroll",
  "netflix",
  "hulu",
  "bilibili",
  "disney",
  "hidive",
  "prime",
  "amazon",
  "youtube",
  "funimation",
] as const;

export function getStreamingLinks(links: MediaExternalLink[] | undefined): MediaExternalLink[] {
  if (!links) return [];
  return links.filter(
    (link) =>
      link.url &&
      (link.type === "STREAMING" ||
        STREAMING_SITES.some((s) => link.site?.toLowerCase().includes(s))),
  );
}

export function getTitle(title: MediaTitle): string {
  return title.english ?? title.romaji ?? title.userPreferred ?? "Unknown";
}

export type CoverTier = "extraLarge" | "large" | "medium";

export function getCover(image: MediaCoverImage, tier: CoverTier = "large"): string | undefined {
  return image[tier] ?? image.extraLarge ?? image.large ?? image.medium;
}

export function getMediaTitle(media: Media): string {
  return getTitle(media.title);
}

export function getMediaCover(media: Media, tier?: CoverTier): string | undefined {
  return getCover(media.coverImage, tier);
}

export function stripHtml(value?: string): string | undefined {
  if (!value) return undefined;
  const text = value.replace(/<[^>]*>/g, "").trim();
  return text || undefined;
}

export function fromAiringTimestamp(unixSeconds: number): Date {
  return new Date(unixSeconds * 1000);
}

export type AiringPhase = "upcoming" | "live" | "aired";

export function getAiringPhase(airingAt: number, now = Date.now() / 1000): AiringPhase {
  if (airingAt > now) return "upcoming";
  if (airingAt > now - 1800) return "live";
  return "aired";
}

export function formatCountdown(airingAt: number, now = Date.now() / 1000): string {
  const diff = airingAt - now;
  if (diff <= 0) return "";
  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function localDateStr(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Minutes east of UTC for the given instant (Bangkok +7 → 420, New York -5 → -300).
 * getTimezoneOffset() returns minutes BEHIND UTC, so the sign is inverted.
 * Must be read client-side: the server cannot know the visitor's timezone.
 */
export function getLocalOffsetMinutes(date: Date = new Date()): number {
  return -date.getTimezoneOffset();
}

/** Compact timezone label, e.g. "GMT+7", "GMT-5", "GMT+5:30". Defaults to the
 * browser/visitor offset when no offset is given. */
export function getTimezoneLabel(offsetMinutes?: number): string {
  const o =
    typeof offsetMinutes === "number" && Number.isFinite(offsetMinutes)
      ? offsetMinutes
      : getLocalOffsetMinutes();
  const sign = o >= 0 ? "+" : "-";
  const abs = Math.abs(o);
  const hours = Math.floor(abs / 60);
  const minutes = abs % 60;
  return `GMT${sign}${hours}${minutes ? `:${String(minutes).padStart(2, "0")}` : ""}`;
}

/** Hour (0-23) of an epoch second within the offset-defined local day. */
export function getOffsetHour(epochSeconds: number, offsetMinutes: number): number {
  return Math.floor(((epochSeconds + offsetMinutes * 60) % 86400) / 3600);
}

/** Current calendar date (YYYY-MM-DD) in the offset's timezone. */
export function getOffsetTodayStr(offsetMinutes: number): string {
  const d = new Date(Date.now() + offsetMinutes * 60_000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(
    d.getUTCDate(),
  ).padStart(2, "0")}`;
}

export function isSafeExternalUrl(value: string | undefined): value is string {
  if (!value) return false;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return "";
  }
}
