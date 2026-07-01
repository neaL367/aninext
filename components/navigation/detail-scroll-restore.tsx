"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useLayoutEffect } from "react";
import {
  consumePendingScrollRestore,
  hasPendingScrollRestore,
  readCurrentHref,
  reconcileScrollPosition,
  restoreScrollWithRetry,
} from "@/lib/navigation/scroll-restore";

/** Applies queued scroll position after breadcrumb return navigation. */
export function DetailScrollRestore() {
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  useLayoutEffect(() => {
    const href = readCurrentHref();
    const scrollY = consumePendingScrollRestore(href);
    if (scrollY != null) {
      restoreScrollWithRetry(scrollY);
      return;
    }

    // Wait for search params to settle before reconciling — avoids clobbering a
    // pending restore to `/anime?sort=…` when pathname updates first.
    if (!hasPendingScrollRestore()) {
      reconcileScrollPosition();
    }
  }, [pathname, search]);

  return null;
}
