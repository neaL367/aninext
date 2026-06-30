import type { ReactNode } from "react";
import { DetailCoverShell } from "@/components/detail/detail-cover-shell";
import {
  DETAIL_COVER_CLASS,
} from "@/lib/styles/detail-page-layout";
import { cn } from "@/lib/utils";

type DetailCoverRegionProps = {
  children?: ReactNode;
  className?: string;
};

/** Static cover band with optional streamed banner layered on top. */
export function DetailCoverRegion({ children, className }: DetailCoverRegionProps) {
  return (
    <div className={cn(DETAIL_COVER_CLASS, className)}>
      <DetailCoverShell className="absolute inset-0" />
      {children}
      <div
        className="pointer-events-none absolute inset-0 bg-linear-to-b from-background/5 via-background/25 to-background"
        aria-hidden
      />
    </div>
  );
}
