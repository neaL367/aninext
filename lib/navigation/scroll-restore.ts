import { readAppliedScrollY, resizeScrollMetrics, scrollToY } from "@/lib/navigation/scroll-apply";

const PENDING_SCROLL_RESTORE_KEY = "aninext:pending-scroll-restore";

type PendingScrollRestore = {
  href: string;
  scrollY: number;
};

/** Stable comparison for `/anime?b=1&a=2` vs `/anime?a=2&b=1`. */
export function normalizeHrefForScrollRestore(href: string): string {
  if (!href) return "/";
  const [pathname, search = ""] = href.split("?");
  const lowerPathname = pathname.toLowerCase();
  if (!search) {
    return lowerPathname || "/";
  }

  const params = new URLSearchParams(search);
  const normalizedSearch = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key.toLowerCase()}=${value.toLowerCase()}`)
    .join("&");

  return normalizedSearch ? `${lowerPathname}?${normalizedSearch}` : lowerPathname || "/";
}

export function readCurrentHref(): string {
  if (typeof window === "undefined") {
    return "/";
  }
  return `${window.location.pathname}${window.location.search}`;
}

export function readScrollY(): number {
  return readAppliedScrollY();
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
const RESTORE_LATE_MS = 150;
const USER_INPUT_EVENTS = ["wheel", "touchstart", "keydown"] as const;

let activeRestoreCleanup: (() => void) | null = null;

/** Stop any in-flight programmatic scroll restore (e.g. user started scrolling). */
export function cancelScrollRestore(): void {
  activeRestoreCleanup?.();
  activeRestoreCleanup = null;
}

/** Re-apply scroll until the page is tall enough, then release control to the user. */
export function restoreScrollWithRetry(scrollY: number): void {
  if (typeof window === "undefined" || scrollY <= 0) {
    return;
  }

  cancelScrollRestore();

  resizeScrollMetrics();

  let cancelled = false;
  let attempts = 0;
  let rafId = 0;
  const timeouts: ReturnType<typeof setTimeout>[] = [];

  const cleanup = () => {
    if (cancelled) {
      return;
    }

    cancelled = true;
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
    for (const timeout of timeouts) {
      clearTimeout(timeout);
    }
    for (const event of USER_INPUT_EVENTS) {
      window.removeEventListener(event, onUserInput);
    }
    if (activeRestoreCleanup === cleanup) {
      activeRestoreCleanup = null;
    }
  };

  const onUserInput = () => {
    cleanup();
  };

  const apply = () => {
    if (cancelled) {
      return;
    }

    const target = clampScrollY(scrollY);
    scrollToY(target, { immediate: true });

    const closeEnough = Math.abs(readAppliedScrollY() - target) <= 8;
    const tallEnough =
      getMaxScrollY() >= scrollY - 1 ||
      document.documentElement.scrollHeight >= scrollY + window.innerHeight * 0.5;

    if (closeEnough && tallEnough) {
      cleanup();
      return;
    }

    attempts += 1;
    if (attempts < RESTORE_MAX_ATTEMPTS) {
      rafId = requestAnimationFrame(apply);
    } else {
      cleanup();
    }
  };

  activeRestoreCleanup = cleanup;

  for (const event of USER_INPUT_EVENTS) {
    window.addEventListener(event, onUserInput, { passive: true });
  }

  rafId = requestAnimationFrame(apply);

  timeouts.push(
    setTimeout(() => {
      if (!cancelled) {
        scrollToY(clampScrollY(scrollY), { immediate: true });
        cleanup();
      }
    }, RESTORE_LATE_MS),
  );
}

/** Clear a stranded scroll position when the new page is shorter than the viewport offset. */
export function reconcileScrollPosition(): void {
  if (typeof window === "undefined") {
    return;
  }

  const maxScroll = getMaxScrollY();
  if (window.scrollY > maxScroll) {
    scrollToY(maxScroll, { immediate: true });
  }
}
