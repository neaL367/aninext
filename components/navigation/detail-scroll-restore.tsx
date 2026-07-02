"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useLayoutEffect } from "react";
import { hasBrowseRestorePending } from "@/lib/navigation/browse-restore";
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

    // Browse restores pages + scroll together in AnimeBrowseResults.
    if (pathname === "/anime" && hasBrowseRestorePending(href)) {
      return;
    }

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
