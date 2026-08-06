import type { Media, MediaTitle, MediaCoverImage } from "@/features/anime/types/anime";
import { formatFormat, formatStatus } from "./labels";

export { formatFormat, formatStatus } from "./labels";

export function getTitle(title: MediaTitle): string {
  return title.english ?? title.romaji ?? title.userPreferred ?? "Unknown";
}

export function getCover(image: MediaCoverImage): string | undefined {
  return image.large ?? image.extraLarge;
}

export function getMediaTitle(media: Media): string {
  return getTitle(media.title);
}

export function getMediaCover(media: Media): string | undefined {
  return getCover(media.coverImage);
}

export function fromAiringTimestamp(unixSeconds: number): Date {
  return new Date(unixSeconds * 1000);
}

export function localDateStr(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
