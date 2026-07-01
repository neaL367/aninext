"use client";

import { createContext, use, useState, type ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const DEFAULT_TOOLTIP_WIDTH =
  "min-w-0 max-w-[min(100vw-1.5rem,24rem)] w-80 sm:max-w-[min(100vw-1.5rem,28rem)] sm:w-96";

export const AIRING_TOOLTIP_WIDTH =
  "min-w-0 max-w-[min(100vw-1.5rem,28rem)] w-96 sm:max-w-[min(100vw-1.5rem,32rem)] sm:w-[28rem]";

type MediaTooltipContextValue = {
  open: boolean;
};

const MediaTooltipContext = createContext<MediaTooltipContextValue | null>(null);

function useMediaTooltipContext() {
  const context = use(MediaTooltipContext);
  if (!context) {
    throw new Error("MediaTooltip subcomponents must be used within MediaTooltip");
  }
  return context;
}

/** Whether the tooltip popup is open (for lazy-loading tooltip data). */
export function useMediaTooltipOpen(): boolean {
  return useMediaTooltipContext().open;
}

function MediaTooltipRoot({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <MediaTooltipContext value={{ open }}>
      <Tooltip open={open} onOpenChange={setOpen}>
        {children}
      </Tooltip>
    </MediaTooltipContext>
  );
}

function MediaTooltipTrigger({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <TooltipTrigger
      className={cn(
        "block w-full rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      {children}
    </TooltipTrigger>
  );
}

function MediaTooltipContent({ children, className }: { children: ReactNode; className?: string }) {
  const { open } = useMediaTooltipContext();

  return (
    <TooltipContent
      variant="card"
      side="top"
      sideOffset={10}
      className={cn(DEFAULT_TOOLTIP_WIDTH, className)}
    >
      {open ? children : null}
    </TooltipContent>
  );
}

export const MediaTooltip = Object.assign(MediaTooltipRoot, {
  Trigger: MediaTooltipTrigger,
  Content: MediaTooltipContent,
});
