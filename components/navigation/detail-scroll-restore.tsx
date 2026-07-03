"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useLayoutEffect, useRef } from "react";
import { hasBrowseRestorePending } from "@/lib/navigation/browse-restore";
import { isDetailPath, isDetailReturnOrigin, readDetailReturn } from "@/lib/navigation/detail-return";
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
  const previousHrefRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    const href = readCurrentHref();
    const previousHref = previousHrefRef.current;
    previousHrefRef.current = href;

    // Browse restores pages + scroll together in AnimeBrowseResults.
    if (pathname === "/anime" && hasBrowseRestorePending(href)) {
      return;
    }

    const scrollY = consumePendingScrollRestore(href);
    if (scrollY != null) {
      restoreScrollWithRetry(scrollY);
      return;
    }

    const previousPathname = previousHref?.split("?")[0] || null;
    const detailReturn = readDetailReturn();
    if (
      previousPathname &&
      isDetailPath(previousPathname) &&
      pathname !== "/anime" &&
      detailReturn?.scrollY != null &&
      detailReturn.scrollY > 0 &&
      isDetailReturnOrigin(href, detailReturn)
    ) {
      restoreScrollWithRetry(detailReturn.scrollY);
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
