"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";
import {
  consumePendingScrollRestore,
  readCurrentHref,
  restoreScrollWithRetry,
} from "@/lib/navigation/scroll-restore";

/** Applies queued scroll position after breadcrumb return navigation. */
export function DetailScrollRestore() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const href = readCurrentHref();
    const scrollY = consumePendingScrollRestore(href);
    if (scrollY == null) {
      return;
    }
    restoreScrollWithRetry(scrollY);
  }, [pathname]);

  return null;
}
