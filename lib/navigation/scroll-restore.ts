const PENDING_SCROLL_RESTORE_KEY = "aninext:pending-scroll-restore";

type PendingScrollRestore = {
  href: string;
  scrollY: number;
};

/** Stable comparison for `/anime?b=1&a=2` vs `/anime?a=2&b=1`. */
export function normalizeHrefForScrollRestore(href: string): string {
  const [pathname, search = ""] = href.split("?");
  if (!search) {
    return pathname || "/";
  }

  const params = new URLSearchParams(search);
  const normalizedSearch = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return normalizedSearch ? `${pathname}?${normalizedSearch}` : pathname || "/";
}

export function readCurrentHref(): string {
  if (typeof window === "undefined") {
    return "/";
  }
  return `${window.location.pathname}${window.location.search}`;
}

export function readScrollY(): number {
  if (typeof window === "undefined") {
    return 0;
  }
  return Math.max(0, Math.round(window.scrollY));
}

export function getMaxScrollY(): number {
  if (typeof window === "undefined") {
    return 0;
  }
  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
}

export function clampScrollY(scrollY: number): number {
  return Math.max(0, Math.min(Math.round(scrollY), getMaxScrollY()));
}

export function queueScrollRestore(href: string, scrollY: number): void {
  if (typeof window === "undefined") {
    return;
  }

  const payload: PendingScrollRestore = {
    href: normalizeHrefForScrollRestore(href),
    scrollY: Math.max(0, Math.round(scrollY)),
  };
  sessionStorage.setItem(PENDING_SCROLL_RESTORE_KEY, JSON.stringify(payload));
}

export function hasPendingScrollRestore(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return sessionStorage.getItem(PENDING_SCROLL_RESTORE_KEY) !== null;
}

export function consumePendingScrollRestore(currentHref: string): number | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = sessionStorage.getItem(PENDING_SCROLL_RESTORE_KEY);
    if (!raw) {
      return null;
    }

    const payload = JSON.parse(raw) as PendingScrollRestore;
    const normalizedCurrent = normalizeHrefForScrollRestore(currentHref);
    const normalizedPending = normalizeHrefForScrollRestore(payload.href);

    if (normalizedPending !== normalizedCurrent) {
      return null;
    }

    sessionStorage.removeItem(PENDING_SCROLL_RESTORE_KEY);
    return typeof payload.scrollY === "number" ? payload.scrollY : null;
  } catch {
    sessionStorage.removeItem(PENDING_SCROLL_RESTORE_KEY);
    return null;
  }
}

const RESTORE_MAX_ATTEMPTS = 24;

/** Re-apply scroll until the page is tall enough (infinite lists) or attempts run out. */
export function restoreScrollWithRetry(scrollY: number): void {
  if (typeof window === "undefined" || scrollY <= 0) {
    return;
  }

  let attempts = 0;

  const apply = () => {
    const target = clampScrollY(scrollY);
    window.scrollTo({ top: target, left: 0, behavior: "instant" });

    const tallEnough =
      getMaxScrollY() >= scrollY - 1 ||
      document.documentElement.scrollHeight >= scrollY + window.innerHeight * 0.5;

    attempts += 1;
    if (!tallEnough && attempts < RESTORE_MAX_ATTEMPTS) {
      requestAnimationFrame(apply);
    }
  };

  requestAnimationFrame(apply);
}

/** Clear a stranded scroll position when the new page is shorter than the viewport offset. */
export function reconcileScrollPosition(): void {
  if (typeof window === "undefined") {
    return;
  }

  const maxScroll = getMaxScrollY();
  if (window.scrollY > maxScroll) {
    window.scrollTo({ top: maxScroll, left: 0, behavior: "instant" });
  }
}
