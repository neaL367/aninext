import type { MediaDetail } from "@/lib/anilist/types";

export function getDetailStudios(media: MediaDetail): string {
  return (
    media.studios?.nodes
      ?.filter((s): s is NonNullable<typeof s> => Boolean(s))
      .map((s) => s.name)
      .join(", ") || "—"
  );
}
