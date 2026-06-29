"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type MediaTooltipProps = {
  content: React.ReactNode;
  children: React.ReactNode;
};

export function MediaTooltip({ content, children }: MediaTooltipProps) {
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
        sideOffset={8}
        className="w-[18rem]"
      >
        {content}
      </TooltipContent>
    </Tooltip>
  );
}
