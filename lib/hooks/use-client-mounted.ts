"use client";

import { useLayoutEffect, useState } from "react";

/** True after the first client commit — keeps SSR and hydration markup aligned. */
export function useClientMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
