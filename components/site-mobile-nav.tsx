"use client";

import { CalendarDaysIcon, CompassIcon, HouseIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import type { Route } from "next";

const items: Array<{ href: Route; label: string; icon: typeof CompassIcon; prefetch?: boolean }> = [
  { href: "/", label: "Home", icon: HouseIcon },
  { href: "/anime/trending", label: "Trending", icon: CompassIcon },
  { href: "/airing", label: "Airing", icon: CalendarDaysIcon, prefetch: false },
];

export function SiteMobileNav() {
  "use memo";
  const pathname = usePathname();

  const isActive = (href: Route) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border-soft bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-2xl md:hidden"
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
                "relative flex min-h-11 flex-col items-center justify-center gap-1 font-mono text-[0.58rem] uppercase tracking-[0.12em] transition-colors",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {active && (
                <span aria-hidden="true" className="absolute top-0 h-px w-7 bg-signal" />
              )}
              <Icon aria-hidden="true" className="size-4" strokeWidth={active ? 1.8 : 1.4} />
              {label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => document.dispatchEvent(new CustomEvent("open-search"))}
          className="flex min-h-11 flex-col items-center justify-center gap-1 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <SearchIcon aria-hidden="true" className="size-4" strokeWidth={1.4} />
          Search
        </button>
      </div>
    </nav>
  );
}
