import { cn } from "@/lib/utils";

export function navLinkClassName(active: boolean) {
  return cn(
    "inline-flex min-h-9 items-center px-2 py-1.5 text-xs font-medium whitespace-nowrap sm:text-sm",
    "underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    active
      ? "text-foreground underline"
      : "text-muted-foreground hover:text-foreground hover:underline",
  );
}

export const viewAllLinkClassName =
  "shrink-0 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline";
