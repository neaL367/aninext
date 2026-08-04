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

export function formatStatus(status: string): string {
  const map: Record<string, string> = {
    FINISHED: "Finished",
    RELEASING: "Airing",
    NOT_YET_RELEASED: "Not yet released",
    CANCELLED: "Cancelled",
    HIATUS: "Hiatus",
  };
  return map[status] ?? status;
}

export function formatFormat(format: string): string {
  const map: Record<string, string> = {
    TV: "TV",
    TV_SHORT: "TV Short",
    MOVIE: "Movie",
    SPECIAL: "Special",
    OVA: "OVA",
    ONA: "ONA",
    MUSIC: "Music",
  };
  return map[format] ?? format;
}
