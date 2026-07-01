import type { Route } from "next";
import type { DetailCategory } from "@/lib/anilist/domain/detail-categories";

/** URL-safe slug from a display name (AniList-style). */
export function buildDetailSlug(name: string): string {
  const slug = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "unknown";
}

export function entityDetailPath(category: DetailCategory, id: number, name: string): Route {
  return `/${category}/${id}/${buildDetailSlug(name)}` as Route;
}

export function animeDetailPath(id: number, title: string): Route {
  return entityDetailPath("anime", id, title);
}

export function mangaDetailPath(id: number, title: string): Route {
  return entityDetailPath("manga", id, title);
}

export function characterDetailPath(id: number, name: string): Route {
  return entityDetailPath("character", id, name);
}

export function staffDetailPath(id: number, name: string): Route {
  return entityDetailPath("staff", id, name);
}
