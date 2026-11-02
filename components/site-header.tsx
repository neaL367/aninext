"use client";

import { SearchIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import type { Route } from "next";

const navItems: Array<{ href: Route; label: string; prefetch?: boolean }> = [
  { href: "/anime/trending", label: "Trending" },
  { href: "/anime/top100", label: "Top 100" },
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
    <header className="sticky top-0 z-50 border-b border-border-soft bg-background/75 backdrop-blur-2xl">
      <div className="mx-auto flex h-14 w-full max-w-[1760px] items-center gap-8 px-4 sm:px-7 lg:px-10">
        <Link
          href="/"
          className="group flex shrink-0 items-baseline gap-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
          aria-label="AniNext home"
        >
          <span className="font-serif text-[1.35rem] leading-none tracking-[-0.03em] text-foreground">
            AniNext
          </span>
          <span
            aria-hidden="true"
            className="size-1 rounded-full bg-signal transition-transform duration-300 group-hover:scale-150"
          />
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch={item.prefetch}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "relative py-1 font-mono text-[0.68rem] uppercase tracking-[0.16em] transition-colors",
                isActive(item.href)
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
              {isActive(item.href) && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 -bottom-0.5 h-px bg-signal"
                />
              )}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center">
          <button
            type="button"
            onClick={() => document.dispatchEvent(new CustomEvent("open-search"))}
            aria-label="Search anime"
            aria-keyshortcuts="Control+K Meta+K"
            className="group flex h-9 items-center gap-2.5 rounded-sm px-2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          >
            <SearchIcon aria-hidden="true" className="size-4" strokeWidth={1.5} />
            <kbd className="hidden font-mono text-[0.62rem] tracking-[0.12em] text-muted-foreground/60 transition-colors group-hover:text-muted-foreground sm:inline">
              ⌘K
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
      className="sticky top-0 z-50 border-b border-border-soft bg-background/75 backdrop-blur-2xl"
      aria-hidden
    >
      <div className="mx-auto h-14 w-full max-w-[1760px] px-4 sm:px-7 lg:px-10" />
    </header>
  );
}
