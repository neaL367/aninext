"use client";

import { ArrowUpIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SHOW_AFTER_PX = 600;

// Browse collections have their own page-rail navigation — the floating
// button stays out of the way there and shows everywhere else.
const BROWSE_RE = /^\/anime\/(trending|popular|top100|upcoming|alltimepopular|seasonal)(\/|$)/;

/** Floating button that appears after scrolling down, jumping back to top. */
export function ScrollToTopButton() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  // Visibility subscription via ref callback (React 19 cleanup) — no effect.
  // The button is permanently mounted, so this attaches exactly once.
  const trackRef = useCallback((_node: HTMLButtonElement | null) => {
    if (!_node) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      setVisible(window.scrollY > SHOW_AFTER_PX);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  if (BROWSE_RE.test(pathname)) return null;

  return (
    <Button
      type="button"
      size="icon"
      ref={trackRef}
      aria-label="Scroll to top"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      onClick={() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      }}
      className={cn(
        "fixed right-4 bottom-20 z-40 size-10 cursor-pointer rounded-full shadow-lg transition-all duration-200 md:right-6 md:bottom-6",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
      )}
    >
      <ArrowUpIcon className="size-4" />
    </Button>
  );
}
