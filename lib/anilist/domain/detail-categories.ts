import { notFound } from "next/navigation";

export const DETAIL_CATEGORIES = [
  "anime",
  "manga",
  "character",
  "staff",
] as const;

export type DetailCategory = (typeof DETAIL_CATEGORIES)[number];

export function isDetailCategory(value: string): value is DetailCategory {
  return DETAIL_CATEGORIES.includes(value as DetailCategory);
}

export function parseDetailCategory(value: string): DetailCategory {
  if (!isDetailCategory(value)) {
    notFound();
  }

  return value;
}
