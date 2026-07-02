"use client";

import { useLenis } from "lenis/react";
import { useEffect } from "react";
import { registerScrollController } from "@/lib/navigation/scroll-apply";

/** Registers the root Lenis instance for instant / quick programmatic scroll. */
export function LenisScrollBridge() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) {
      return;
    }

    registerScrollController({
      scrollTo: (target, options) => {
        lenis.scrollTo(target, {
          immediate: options?.immediate,
          duration: options?.duration,
        });
      },
      getScrollY: () => lenis.scroll,
      resize: () => lenis.resize(),
    });

    return () => {
      registerScrollController(null);
    };
  }, [lenis]);

  return null;
}
