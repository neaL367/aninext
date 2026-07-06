import type { MediaPageResult } from "@/lib/anilist/domain/types";
import { normalizeBrowseHrefForRestore } from "@/lib/navigation/browse-href";
import { readAppliedScrollY } from "@/lib/navigation/scroll-apply";
import { getMaxScrollY, readCurrentHref } from "@/lib/navigation/scroll-restore";

const BROWSE_RESTORE_KEY = "aninext:browse-restore";
const PENDING_SCROLL_RESTORE_KEY = "aninext:pending-scroll-restore";

export type BrowseRestoreState = {
  href: string;
  filterKey: string;
  pages: MediaPageResult[];
  scrollY: number;
  wasNearBottom?: boolean;
};

/** Map of filterKey -> BrowseRestoreState to remember positions across different sorts/filters. */
type BrowseRestoreMap = Record<string, BrowseRestoreState>;

const BROWSE_RESUME_THRESHOLD_PX = 900;

let latestSnapshots: Partial<Record<string, Pick<BrowseRestoreState, "href" | "filterKey" | "pages">>> = {};

export function updateBrowseRestoreSnapshot(
  href: string,
  filterKey: string,
  pages: MediaPageResult[],
): void {
  if (typeof window === "undefined" || pages.length === 0) {
    return;
  }

  latestSnapshots[filterKey] = {
    href: normalizeBrowseHrefForRestore(href),
    filterKey,
    pages,
  };
}

/** Persist the current browse state into the global map. */
export function persistBrowseRestoreSnapshot(scrollY = readAppliedScrollY()): void {
  if (typeof window === "undefined") {
    return;
  }

  // We need the current filterKey to know which entry to update.
  // We can derive it from the current URL.
  const currentHref = readCurrentHref();
  if (!currentHref) return;
  
  // Use a temporary extraction of the filterKey from the URL or a provided one.
  // Since we don't have the filterKey here, we'll look for the match in our latestSnapshots.
  const matchingKey = Object.keys(latestSnapshots).find(key => 
    latestSnapshots[key]?.href === normalizeBrowseHrefForRestore(currentHref)
  );

  if (!matchingKey) return;

  const snapshot = latestSnapshots[matchingKey];
  if (!snapshot) return;
  const state: BrowseRestoreState = {
    ...snapshot,
    scrollY: Math.max(0, Math.round(scrollY)),
    wasNearBottom: getMaxScrollY() - scrollY <= BROWSE_RESUME_THRESHOLD_PX,
  };

  try {
    const map: BrowseRestoreMap = JSON.parse(sessionStorage.getItem(BROWSE_RESTORE_KEY) || "{}");
    map[matchingKey] = state;
    sessionStorage.setItem(BROWSE_RESTORE_KEY, JSON.stringify(map));
  } catch {
    sessionStorage.removeItem(BROWSE_RESTORE_KEY);
  }
}

function readBrowseRestoreMap(): BrowseRestoreMap {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = sessionStorage.getItem(BROWSE_RESTORE_KEY);
    if (!raw) {
      return {};
    }

    return JSON.parse(raw) as BrowseRestoreMap;
  } catch {
    sessionStorage.removeItem(BROWSE_RESTORE_KEY);
    return {};
  }
}

export function peekBrowseRestore(currentHref: string, filterKey?: string): BrowseRestoreState | null {
  const map = readBrowseRestoreMap();
  
  // If filterKey is provided, look it up directly.
  if (filterKey && map[filterKey]) {
    const state = map[filterKey];
    if (normalizeBrowseHrefForRestore(state.href) === normalizeBrowseHrefForRestore(currentHref)) {
      return state;
    }
  }

  // Fallback: look for any entry that matches the current href.
  const matchingEntry = Object.values(map).find(state => 
    normalizeBrowseHrefForRestore(state.href) === normalizeBrowseHrefForRestore(currentHref)
  );

  return matchingEntry ?? null;
}

export function hasBrowseRestorePending(currentHref = readCurrentHref(), filterKey?: string): boolean {
  return peekBrowseRestore(currentHref, filterKey) != null;
}

export function consumeBrowseRestore(
  currentHref: string,
  filterKey?: string,
): Pick<BrowseRestoreState, "pages" | "scrollY" | "wasNearBottom"> | null {
  const map = readBrowseRestoreMap();
  const state = peekBrowseRestore(currentHref, filterKey);

  if (!state) {
    return null;
  }

  // Remove only the specific entry we are consuming.
  delete map[state.filterKey];
  sessionStorage.setItem(BROWSE_RESTORE_KEY, JSON.stringify(map));
  sessionStorage.removeItem(PENDING_SCROLL_RESTORE_KEY);

  const pages = Array.isArray(state.pages) ? state.pages : [];
  const scrollY = typeof state.scrollY === "number" ? state.scrollY : 0;
  const wasNearBottom = state.wasNearBottom === true;

  if (pages.length === 0 && scrollY <= 0) {
    return null;
  }

  return { pages, scrollY, wasNearBottom };
}
