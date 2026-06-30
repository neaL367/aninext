const PENDING_SCROLL_RESTORE_KEY = "aninext:pending-scroll-restore";

type PendingScrollRestore = {
  href: string;
  scrollY: number;
};

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

export function queueScrollRestore(href: string, scrollY: number): void {
  if (typeof window === "undefined") {
    return;
  }

  const payload: PendingScrollRestore = {
    href,
    scrollY: Math.max(0, Math.round(scrollY)),
  };
  sessionStorage.setItem(PENDING_SCROLL_RESTORE_KEY, JSON.stringify(payload));
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
    if (payload.href !== currentHref) {
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
    window.scrollTo({ top: scrollY, left: 0, behavior: "instant" });

    const tallEnough =
      document.documentElement.scrollHeight >= scrollY + window.innerHeight * 0.5;

    attempts += 1;
    if (!tallEnough && attempts < RESTORE_MAX_ATTEMPTS) {
      requestAnimationFrame(apply);
    }
  };

  requestAnimationFrame(apply);
}
