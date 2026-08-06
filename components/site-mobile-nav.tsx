"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { CalendarDaysIcon, CompassIcon, SearchIcon, TrophyIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const items: Array<{ href: Route; label: string; icon: typeof CompassIcon; prefetch?: boolean }> = [
  { href: "/", label: "Home", icon: CompassIcon },
  { href: "/anime/top100", label: "Rank", icon: TrophyIcon },
  { href: "/airing", label: "Live", icon: CalendarDaysIcon, prefetch: false },
];

export function SiteMobileNav() {
  const pathname = usePathname();

  const isActive = (href: Route) => {
    if (href === "/") return pathname === "/";
    if (href === "/airing") return pathname.startsWith("/airing");
    return pathname.startsWith("/anime");
  };

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border-soft bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
    >
      <div className="mx-auto grid h-16 max-w-md grid-cols-4 px-2">
        {items.map(({ href, label, icon: Icon, prefetch }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              prefetch={prefetch}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex min-h-11 flex-col items-center justify-center gap-1 text-[0.63rem] font-medium transition-colors",
                active ? "text-signal" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {active && <span className="absolute top-0 h-px w-8 bg-foreground/40" aria-hidden="true" />}
              <Icon aria-hidden="true" className="size-4" strokeWidth={active ? 2 : 1.5} />
              {label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => document.dispatchEvent(new CustomEvent("open-search"))}
          className="flex min-h-11 flex-col items-center justify-center gap-1 text-[0.63rem] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <SearchIcon aria-hidden="true" className="size-4" strokeWidth={1.5} />
          Search
        </button>
      </div>
    </nav>
  );
}
