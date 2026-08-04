import type { Media, MediaTitle, MediaCoverImage } from "@/features/anime/types/anime";

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
