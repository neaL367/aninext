"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { SparklesIcon, SearchIcon } from "lucide-react";
import { SearchCommand } from "@/features/anime/components/search-command";
import { cn } from "@/lib/utils";

const navItems: Array<{ href: Route; label: string }> = [
  { href: "/anime/trending", label: "Anime" },
  { href: "/airing", label: "Airing" },
];

export function SiteHeader() {
  const pathname = usePathname();

  const isActive = (href: Route) => {
    if (href === "/") return pathname === "/";
    if (href === "/airing") return pathname.startsWith("/airing");
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-soft bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2"
          aria-label="AniNext home"
        >
          <div className="flex size-8 items-center justify-center rounded-lg bg-accent/10">
            <SparklesIcon className="size-4 text-accent" />
          </div>
          <span className="text-lg font-semibold tracking-tight">AniNext</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted/50 hover:text-foreground",
                isActive(item.href)
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {item.label}
              {isActive(item.href) && (
                <span className="absolute inset-x-3 -bottom-[1px] h-px bg-foreground" />
              )}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => document.dispatchEvent(new CustomEvent("open-search"))}
            className="hidden h-9 items-center gap-2 rounded-lg border border-border-soft bg-surface-1/50 px-3 text-sm text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground md:flex"
          >
            <SearchIcon className="size-4" />
            <span>Search...</span>
            <kbd className="pointer-events-none ml-4 inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>
      </div>
    </header>
  );
}
