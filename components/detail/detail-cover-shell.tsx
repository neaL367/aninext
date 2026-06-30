import { cn } from "@/lib/utils";

/** Static cover band for the detail route shell. */
export function DetailCoverShell({ className }: { className?: string }) {
  return (
    <div className={cn("bg-muted/50", className)} aria-hidden />
  );
}
