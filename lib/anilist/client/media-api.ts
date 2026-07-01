import type { MediaPageQueryVariables } from "@/lib/anilist/generated/graphql";
import type { MediaCardTooltip, MediaPageResult } from "@/lib/anilist/domain/types";

const MEDIA_PAGE_ENDPOINT = "/api/media";
const MEDIA_TOOLTIP_ENDPOINT = "/api/media/tooltip";

/** GET a Route Handler and parse its JSON body, throwing a labeled error on failure. */
async function getJson<T>(url: string, label: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load ${label} (${response.status})`);
  }

  return (await response.json()) as T;
}

/**
 * Deterministic serialization of query variables so identical filters map to an
 * identical URL — this is what lets a GET Route Handler response be CDN-cached.
 */
function encodeVariables(variables: MediaPageQueryVariables): string {
  const sortedKeys = Object.keys(variables).sort();
  return JSON.stringify(variables, sortedKeys);
}

/** Browse page reads — GET Route Handler (parallel + CDN-cacheable), not a Server Action. */
export function fetchMediaPageFromApi(
  variables: MediaPageQueryVariables,
): Promise<MediaPageResult> {
  const url = `${MEDIA_PAGE_ENDPOINT}?v=${encodeURIComponent(encodeVariables(variables))}`;
  return getJson<MediaPageResult>(url, "media page");
}

/** Card tooltip reads — GET Route Handler, fired on hover. */
export function fetchMediaCardTooltipFromApi(
  mediaId: number,
): Promise<MediaCardTooltip | null> {
  return getJson<MediaCardTooltip | null>(`${MEDIA_TOOLTIP_ENDPOINT}?id=${mediaId}`, "tooltip");
}
