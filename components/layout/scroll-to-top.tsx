"use client";

import { ArrowUpIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { scrollToTop } from "@/lib/navigation/scroll-apply";
import { cn } from "@/lib/utils";

const SHOW_AFTER_PX = 400;

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > SHOW_AFTER_PX);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = useCallback(() => {
    scrollToTop();
  }, []);

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label="Scroll to top"
      onClick={handleClick}
      className={cn(
        "fixed right-4 bottom-4 z-40 size-10 rounded-full border-border/80 bg-background/95 shadow-md backdrop-blur-sm transition-[opacity,transform] duration-200",
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0",
      )}
    >
      <ArrowUpIcon />
    </Button>
  );
}
