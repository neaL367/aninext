"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { Clock3Icon, HouseIcon, LibraryBigIcon, SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const items: Array<{ href: Route; label: string; icon: typeof HouseIcon }> = [
  { href: "/", label: "Home", icon: HouseIcon },
  { href: "/anime/trending", label: "Anime", icon: LibraryBigIcon },
  { href: "/airing", label: "Airing", icon: Clock3Icon },
];

export function SiteMobileNav() {
  const pathname = usePathname();

  const isActive = (href: Route) => {
    if (href === "/") return pathname === "/";
    if (href === "/airing") return pathname.startsWith("/airing");
    return pathname.startsWith(href);
  };

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border-soft bg-background/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
    >
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex min-h-11 min-w-16 flex-col items-center justify-center gap-1 rounded-xl px-3 text-[11px] font-medium transition-colors",
                active
                  ? "bg-accent/10 text-accent"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon aria-hidden="true" className="size-5" />
              {label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => document.dispatchEvent(new CustomEvent("open-search"))}
          className="flex min-h-11 min-w-16 flex-col items-center justify-center gap-1 rounded-xl px-3 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <SearchIcon aria-hidden="true" className="size-5" />
          Search
        </button>
      </div>
    </nav>
  );
}
