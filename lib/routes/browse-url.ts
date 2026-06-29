import {
  animeListParamsToQuery,
  parseAnimeListParams,
  type AnimeListParams,
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
