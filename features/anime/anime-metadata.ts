import { getAnimeFullDetail } from "./anime-queries";
import { stripHtml } from "./lib/media-helpers";

import type { Metadata } from "next";

export async function getAnimeMetadata(id: number): Promise<Metadata> {
  try {
    const detail = await getAnimeFullDetail(id);
    if (!detail) return {};

    const media = detail.media;
    const title = media.title.english ?? media.title.romaji ?? "Unknown";
    const description = stripHtml(media.description)?.slice(0, 160) ?? "";

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: media.bannerImage ? [{ url: media.bannerImage }] : [],
      },
      alternates: { canonical: `/anime/${id}` },
    };
  } catch {
    // Metadata should not prevent the page from rendering its own retryable
    // error state when AniList is unavailable.
    return {};
  }
}
