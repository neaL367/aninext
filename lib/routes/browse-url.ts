import type { Route } from "next";
import {
  animeListParamsToQuery,
  DEFAULT_ANIME_LIST_PARAMS,
  parseAnimeListParams,
  type AnimeListParams,
  type AnimeSort,
} from "@/lib/routes/search-params";

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

export function animeBrowseHref(
  overrides: Partial<AnimeListParams> & { sort: AnimeSort }
): Route {
  return buildAnimeBrowseHref({
    ...DEFAULT_ANIME_LIST_PARAMS,
    ...overrides,
  }) as Route;
}

/** Canonical "View all" targets matching each home carousel query. */
export const HOME_SECTION_BROWSE_HREFS = {
  trending: animeBrowseHref({ sort: "trending" }),
  airingNow: animeBrowseHref({
    sort: "all-time-popular",
    statuses: ["RELEASING"],
  }),
  popularThisSeason: animeBrowseHref({ sort: "popular-this-season" }),
  upcomingNextSeason: animeBrowseHref({ sort: "upcoming-next-season" }),
  allTimePopular: animeBrowseHref({ sort: "all-time-popular" }),
  top100: animeBrowseHref({ sort: "top-100" }),
} as const satisfies Record<string, Route>;

/** Update the URL without triggering a Next.js navigation / RSC refetch. */
export function replaceAnimeBrowseUrl(params: AnimeListParams): void {
  if (typeof window === "undefined") return;

  const target = buildAnimeBrowseHref(params);
  const current = `${window.location.pathname}${window.location.search}`;
  if (current !== target) {
    window.history.replaceState(window.history.state, "", target);
  }
}

export function readAnimeBrowseParamsFromLocation(): AnimeListParams {
  if (typeof window === "undefined") {
    return parseAnimeListParams({});
  }

  const sp = new URLSearchParams(window.location.search);
  const record: Record<string, string | string[]> = {};

  for (const key of new Set(sp.keys())) {
    const values = sp.getAll(key);
    record[key] = values.length > 1 ? values : values[0] ?? "";
  }

  return parseAnimeListParams(record);
}
