"use client";

import { SearchIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import type { Route } from "next";

const navItems: Array<{ href: Route; label: string; prefetch?: boolean }> = [
  { href: "/anime/trending", label: "Discover" },
  { href: "/anime/top100", label: "Rankings" },
  { href: "/airing", label: "Airing", prefetch: false },
];

export function SiteHeader() {
  "use memo";
  const pathname = usePathname();

  const isActive = (href: Route) => {
    if (href === "/airing") return pathname.startsWith("/airing");
    return pathname.startsWith(href) || (href === "/anime/trending" && pathname === "/anime");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border-soft bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 w-full max-w-[1680px] items-center gap-6 px-4 sm:px-7 lg:px-10">
        <Link href="/" className="group flex shrink-0 items-center gap-3" aria-label="AniNext home">
          <span className="flex size-8 items-center justify-center rounded-md bg-signal text-white text-sm font-bold shadow-sm transition-all group-hover:bg-signal-strong">
            A
          </span>
          <span className="hidden leading-none sm:block">
            <span className="block font-mono text-[0.68rem] font-semibold tracking-[0.24em] text-foreground">
              ANINEXT
            </span>
            <span className="mt-0.5 block text-[0.58rem] uppercase tracking-[0.18em] text-muted-foreground">
              Discover anime
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch={item.prefetch}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-2 px-3 py-2 text-xs font-mono uppercase tracking-wider transition-colors",
                isActive(item.href)
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span>{item.label}</span>
              {isActive(item.href) && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-signal" />
              )}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => document.dispatchEvent(new CustomEvent("open-search"))}
            aria-label="Search anime"
            aria-keyshortcuts="Control+K Meta+K"
            className="group flex h-9 items-center gap-2.5 rounded-md border border-border-soft bg-surface-1/80 px-3 font-mono text-xs text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
          >
            <SearchIcon
              aria-hidden="true"
              className="size-3.5 text-muted-foreground group-hover:text-signal"
            />
            <span className="hidden sm:inline">Find a title</span>
            <kbd className="hidden border-l border-border-soft pl-2 font-mono text-[0.62rem] text-muted-foreground sm:inline">
              Ctrl/Cmd K
            </kbd>
          </button>
        </div>
      </div>
    </header>
  );
}

export function SiteHeaderFallback() {
  return (
    <header
      className="sticky top-0 z-50 border-b border-border-soft bg-background/90 backdrop-blur-xl"
      aria-hidden
    >
      <div className="mx-auto min-h-16 w-full max-w-[1680px] px-4 sm:px-7 lg:px-10" />
    </header>
  );
}
