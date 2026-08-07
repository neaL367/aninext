import type { Media, MediaTitle, MediaCoverImage } from "@/features/anime/types/anime";

export { formatFormat, formatStatus } from "./labels";

export function getTitle(title: MediaTitle): string {
  return title.english ?? title.romaji ?? title.userPreferred ?? "Unknown";
}

export type CoverTier = "extraLarge" | "large" | "medium";

export function getCover(image: MediaCoverImage, tier: CoverTier = "large"): string | undefined {
  return image[tier] ?? image.large ?? image.extraLarge;
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
