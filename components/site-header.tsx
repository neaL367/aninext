"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems: Array<{ href: Route; label: string }> = [
  { href: "/anime/trending", label: "Discover" },
  { href: "/anime/top100", label: "Rankings" },
  { href: "/airing", label: "Airing" },
];

export function SiteHeader() {
  const pathname = usePathname();

  const isActive = (href: Route) => {
    if (href === "/airing") return pathname.startsWith("/airing");
    return pathname.startsWith(href) || (href === "/anime/trending" && pathname === "/anime");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border-soft bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 w-full max-w-[1680px] items-center gap-6 px-4 sm:px-7 lg:px-10">
        <Link href="/" className="group flex shrink-0 items-center gap-3" aria-label="AniNext home">
          <span className="flex size-9 items-center justify-center bg-accent text-white text-sm font-bold transition-colors group-hover:bg-accent/80">
            A
          </span>
          <span className="hidden leading-none sm:block">
            <span className="block font-mono text-[0.68rem] font-semibold tracking-[0.24em]">ANINEXT</span>
            <span className="mt-1 block text-[0.58rem] uppercase tracking-[0.18em] text-muted-foreground">Discover anime</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-2 px-3 py-2 text-sm transition-colors",
                isActive(item.href) ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>{item.label}</span>
              <span className={cn("h-px w-0 bg-foreground/30 transition-all group-hover:w-4", isActive(item.href) && "w-4")} />
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => document.dispatchEvent(new CustomEvent("open-search"))}
            className="group flex h-9 items-center gap-2 border border-border bg-surface-1/60 px-3 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            <SearchIcon className="size-3.5" />
            <span className="hidden sm:inline">Find a title</span>
            <kbd className="hidden border-l border-border pl-2 font-mono text-[0.62rem] text-muted-foreground sm:inline">/</kbd>
          </button>
        </div>
      </div>
    </header>
  );
}
