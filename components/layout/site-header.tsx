"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MenuIcon } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { NavLinksSuspense } from "@/components/layout/site-nav-links";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const isHome = pathname === "/";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <PageContainer className="flex h-14 items-center gap-3">
        <Link
          href="/"
          aria-current={isHome ? "page" : undefined}
          className={cn(
            "min-w-0 shrink truncate text-base font-semibold tracking-tight underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            isHome ? "text-foreground" : "text-foreground hover:underline",
          )}
        >
          AniNext
        </Link>

        <nav
          aria-label="Main navigation"
          className="hidden min-w-0 lg:flex lg:flex-1 lg:justify-center"
        >
          <NavLinksSuspense pathname={pathname} />
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 lg:hidden"
                  aria-label="Open menu"
                />
              }
            >
              <MenuIcon className="size-4" />
            </SheetTrigger>
            {open ? (
              <SheetContent side="right" className="flex h-full w-full max-w-xs flex-col gap-0 p-0">
                <SheetHeader className="shrink-0">
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav
                  aria-label="Mobile navigation"
                  className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6"
                  data-lenis-prevent
                  data-lenis-prevent-wheel
                >
                  <NavLinksSuspense
                    pathname={pathname}
                    orientation="vertical"
                    compact={false}
                    onNavigate={() => setOpen(false)}
                  />
                </nav>
              </SheetContent>
            ) : null}
          </Sheet>
        </div>
      </PageContainer>
    </header>
  );
}
