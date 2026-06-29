"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const DEFAULT_TOOLTIP_WIDTH =
  "min-w-80 w-80 sm:min-w-96 sm:w-96";

type MediaTooltipProps = {
  content: React.ReactNode;
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
      <TooltipTrigger className="block h-full w-full rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
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
  "min-w-96 w-96 sm:min-w-[28rem] sm:w-[28rem]";
