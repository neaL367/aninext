import { ArrowRightIcon } from "lucide-react";

import { HoverPrefetchLink } from "@/components/ui/hover-prefetch-link";

import type { ComponentProps, ReactNode } from "react";

export function ViewAllLink({
  href,
  children,
  ...props
}: ComponentProps<typeof HoverPrefetchLink> & { children: ReactNode }) {
  "use memo";
  return (
    <HoverPrefetchLink
      href={href}
      className="group flex shrink-0 items-center gap-2 border-b border-border-soft pb-1 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:border-signal hover:text-signal"
      {...props}
    >
      {children}
      <ArrowRightIcon className="size-3 transition-transform group-hover:translate-x-1" />
    </HoverPrefetchLink>
  );
}
