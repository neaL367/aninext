import { ArrowUpRightIcon } from "lucide-react";

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
      className="group relative inline-flex shrink-0 items-center gap-1.5 font-mono text-[0.8125rem] uppercase tracking-[0.14em] text-muted-foreground transition-colors before:absolute before:-inset-x-2 before:-inset-y-2.5 before:content-[''] hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
      {...props}
    >
      {children}
      <ArrowUpRightIcon className="size-3 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </HoverPrefetchLink>
  );
}
