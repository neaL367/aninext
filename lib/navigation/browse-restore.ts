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

const BROWSE_RESUME_THRESHOLD_PX = 900;

let latestSnapshot: Pick<BrowseRestoreState, "href" | "filterKey" | "pages"> | null = null;

export function updateBrowseRestoreSnapshot(
  href: string,
  filterKey: string,
  pages: MediaPageResult[],
): void {
  if (typeof window === "undefined" || pages.length === 0) {
    return;
  }

  latestSnapshot = {
    href: normalizeBrowseHrefForRestore(href),
    filterKey,
    pages,
  };
}

/** Persist loaded browse pages + scroll before leaving for a detail page. */
export function persistBrowseRestoreSnapshot(scrollY = readAppliedScrollY()): void {
  if (typeof window === "undefined" || !latestSnapshot) {
    return;
  }

  const payload: BrowseRestoreState = {
    ...latestSnapshot,
    scrollY: Math.max(0, Math.round(scrollY)),
    wasNearBottom: getMaxScrollY() - scrollY <= BROWSE_RESUME_THRESHOLD_PX,
  };

  try {
    sessionStorage.setItem(BROWSE_RESTORE_KEY, JSON.stringify(payload));
  } catch {
    sessionStorage.removeItem(BROWSE_RESTORE_KEY);
  }
}

function readBrowseRestoreRaw(): BrowseRestoreState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = sessionStorage.getItem(BROWSE_RESTORE_KEY);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as BrowseRestoreState;
  } catch {
    sessionStorage.removeItem(BROWSE_RESTORE_KEY);
    return null;
  }
}

export function peekBrowseRestore(currentHref: string): BrowseRestoreState | null {
  const payload = readBrowseRestoreRaw();
  if (!payload) {
    return null;
  }

  const normalizedCurrent = normalizeBrowseHrefForRestore(currentHref);
  const normalizedSaved = normalizeBrowseHrefForRestore(payload.href);

  if (normalizedSaved !== normalizedCurrent) {
    return null;
  }

  return payload;
}

export function hasBrowseRestorePending(currentHref = readCurrentHref()): boolean {
  return peekBrowseRestore(currentHref) != null;
}

export function consumeBrowseRestore(
  currentHref: string,
): Pick<BrowseRestoreState, "pages" | "scrollY" | "wasNearBottom"> | null {
  const payload = peekBrowseRestore(currentHref);
  if (!payload) {
    return null;
  }

  sessionStorage.removeItem(BROWSE_RESTORE_KEY);
  sessionStorage.removeItem(PENDING_SCROLL_RESTORE_KEY);

  const pages = Array.isArray(payload.pages) ? payload.pages : [];
  const scrollY = typeof payload.scrollY === "number" ? payload.scrollY : 0;
  const wasNearBottom = payload.wasNearBottom === true;

  if (pages.length === 0 && scrollY <= 0) {
    return null;
  }

  return { pages, scrollY, wasNearBottom };
}
