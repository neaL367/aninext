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
