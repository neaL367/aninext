import type { Route } from "next";
import { HOME_SECTION_IDS, type HomeSectionId } from "@/lib/anilist/domain/home-sections";
import { homeSectionToListParams } from "@/lib/browse/anilist-queries";
import {
  animeListParamsToQuery,
  DEFAULT_ANIME_LIST_PARAMS,
  type AnimeListParams,
  type AnimeSort,
} from "@/lib/browse/params";

export function buildAnimeBrowseHref(params: AnimeListParams): string {
  const query = animeListParamsToQuery(params);
  const sp = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      for (const item of value) sp.append(key, item);
    } else {
      sp.set(key, value);
    }
  }

  const search = sp.toString();
  return search ? `/anime?${search}` : "/anime";
}

export function animeBrowseHref(overrides: Partial<AnimeListParams> & { sort: AnimeSort }): Route {
  return buildAnimeBrowseHref({
    ...DEFAULT_ANIME_LIST_PARAMS,
    ...overrides,
  }) as Route;
}

/** Canonical "View all" targets — derived from the same mapping as home carousels. */
export const HOME_SECTION_BROWSE_HREFS = Object.fromEntries(
  HOME_SECTION_IDS.map((section) => [
    section,
    buildAnimeBrowseHref(homeSectionToListParams(section)),
  ]),
) as Record<HomeSectionId, Route>;
