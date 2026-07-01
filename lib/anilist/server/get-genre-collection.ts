import "server-only";

import { cache } from "react";
import type { GenreOption } from "@/lib/anilist/domain/genres";
import { getCachedGenreCollection } from "@/lib/anilist/server/get-cached-genre-collection";

/** Per-request dedupe atop cross-request genre cache. */
export const getGenreCollection = cache(async (): Promise<GenreOption[]> => {
  return getCachedGenreCollection();
});
