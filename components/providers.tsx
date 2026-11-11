"use client";

import { useEffect, type ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    const offset = -new Date().getTimezoneOffset();
    document.cookie = `tz_offset=${offset}; path=/; max-age=31536000; SameSite=Lax`;
  }, []);

  // The theme is fixed to dark in the root layout, so no theme provider here:
  // it used to ship next-themes and its blocking inline script to every page.
  return <>{children}</>;
}
