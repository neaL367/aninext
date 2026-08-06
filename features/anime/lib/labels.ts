export const FORMAT_LABELS: Record<string, string> = {
  TV: "TV",
  TV_SHORT: "TV Short",
  MOVIE: "Movie",
  SPECIAL: "Special",
  OVA: "OVA",
  ONA: "ONA",
  MUSIC: "Music",
};

export const STATUS_LABELS: Record<string, string> = {
  FINISHED: "Finished",
  RELEASING: "Airing",
  NOT_YET_RELEASED: "Not yet released",
  CANCELLED: "Cancelled",
  HIATUS: "Hiatus",
};

export function formatFormat(format: string): string {
  return FORMAT_LABELS[format] ?? format;
}

export function formatStatus(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

export function formatFilterValue(value: string): string {
  return FORMAT_LABELS[value] ?? STATUS_LABELS[value] ?? value;
}
