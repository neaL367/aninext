"use client";

import { useEffect } from "react";

/** Prevent the browser from overriding programmatic scroll on back/forward. */
export function ManualScrollRestoration() {
  useEffect(() => {
    const previous = history.scrollRestoration;
    history.scrollRestoration = "manual";
    return () => {
      history.scrollRestoration = previous;
    };
  }, []);

  return null;
}
