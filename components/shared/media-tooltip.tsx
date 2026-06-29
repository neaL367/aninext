"use client";

import type { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const DEFAULT_TOOLTIP_WIDTH =
  "min-w-0 max-w-[min(100vw-1.5rem,24rem)] w-80 sm:max-w-[min(100vw-1.5rem,28rem)] sm:w-96";

type MediaTooltipProps = {
  content: ReactNode;
  children: React.ReactNode;
  contentClassName?: string;
};

export function MediaTooltip({
  content,
  children,
  contentClassName,
}: MediaTooltipProps) {
  if (!content) {
    return children;
  }

  return (
    <Tooltip>
      <TooltipTrigger className="block w-full rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
        {children}
      </TooltipTrigger>
      <TooltipContent
        variant="card"
        side="top"
        sideOffset={10}
        className={cn(DEFAULT_TOOLTIP_WIDTH, contentClassName)}
      >
        {content}
      </TooltipContent>
    </Tooltip>
  );
}

export const AIRING_TOOLTIP_WIDTH =
  "min-w-0 max-w-[min(100vw-1.5rem,28rem)] w-96 sm:max-w-[min(100vw-1.5rem,32rem)] sm:w-[28rem]";
