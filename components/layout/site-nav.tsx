"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { MenuIcon } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { navLinkClassName } from "@/lib/ui/nav-link-styles";
import { parseAnimeListParams } from "@/lib/routes/search-params";
import { SITE_NAV_ITEMS, type NavItem } from "@/lib/routes/nav-items";
import { cn } from "@/lib/utils";

function isBrowseListingPath(pathname: string): boolean {
  return pathname === "/anime";
}

function isNavItemActive(
  pathname: string,
  searchParams: URLSearchParams,
  item: NavItem
): boolean {
  if (item.href === "/airing") {
    return pathname === "/airing" || pathname.startsWith("/airing/");
  }

  if (item.sortKey) {
    if (!isBrowseListingPath(pathname)) {
      return false;
    }
    const params = parseAnimeListParams(
      Object.fromEntries(searchParams.entries())
    );
    return params.sort === item.sortKey;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function NavLinks({
  pathname,
  searchParams,
  onNavigate,
  className,
  orientation = "horizontal",
  compact = true,
}: {
  pathname: string;
  searchParams: URLSearchParams;
  onNavigate?: () => void;
  className?: string;
  orientation?: "horizontal" | "vertical";
  compact?: boolean;
}) {
  return (
    <ul
      className={cn(
        orientation === "vertical"
          ? "flex flex-col gap-1"
          : "flex items-center gap-0.5",
        className
      )}
    >
      {SITE_NAV_ITEMS.map((item) => {
        const active = isNavItemActive(pathname, searchParams, item);
        return (
          <li key={item.sortKey ?? item.href}>
            <Link
              href={item.href}
              prefetch
              onClick={onNavigate}
              title={compact ? item.title : undefined}
              aria-current={active ? "page" : undefined}
              aria-label={compact ? item.title : undefined}
              className={navLinkClassName(active)}
            >
              {compact ? item.label : item.title}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function SiteHeaderBar() {
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const isHome = pathname === "/";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <PageContainer className="grid h-14 grid-cols-[1fr_auto_1fr] items-center gap-3">
        <Link
          href="/"
          aria-current={isHome ? "page" : undefined}
          className={cn(
            "justify-self-start text-base font-semibold tracking-tight underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            isHome
              ? "text-foreground"
              : "text-foreground hover:underline"
          )}
        >
          AniNext
        </Link>

        <nav
          aria-label="Main navigation"
          className="hidden justify-self-center lg:block"
        >
          <NavLinks pathname={pathname} searchParams={searchParams} />
        </nav>

        <div className="justify-self-end">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  className="size-11 lg:hidden"
                  aria-label="Open menu"
                />
              }
            >
              <MenuIcon data-icon="inline-start" />
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav aria-label="Mobile navigation" className="px-4 pb-6">
                <NavLinks
                  pathname={pathname}
                  searchParams={searchParams}
                  orientation="vertical"
                  compact={false}
                  onNavigate={() => setOpen(false)}
                />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </PageContainer>
    </header>
  );
}
