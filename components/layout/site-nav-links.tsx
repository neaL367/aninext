"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, type ComponentProps } from "react";
import { navLinkClassName } from "@/lib/styles/nav-link-styles";
import { parseAnimeListParams } from "@/lib/browse/params";
import { SITE_NAV_ITEMS, type NavItem } from "@/lib/navigation/nav-items";
import { cn } from "@/lib/utils";

const EMPTY_SEARCH_PARAMS = new URLSearchParams();

function isBrowseListingPath(pathname: string): boolean {
  return pathname === "/anime";
}

function isNavItemActive(pathname: string, searchParams: URLSearchParams, item: NavItem): boolean {
  if (item.href === "/airing") {
    return pathname === "/airing" || pathname.startsWith("/airing/");
  }

  if (item.sortKey) {
    if (!isBrowseListingPath(pathname)) {
      return false;
    }
    const params = parseAnimeListParams(Object.fromEntries(searchParams.entries()));
    return params.sort === item.sortKey;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function NavLinks({
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
        orientation === "vertical" ? "flex flex-col gap-1" : "flex items-center gap-0.5",
        className,
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

function NavLinksWithSearchParams({
  pathname,
  ...rest
}: Omit<ComponentProps<typeof NavLinks>, "searchParams">) {
  const searchParams = useSearchParams();
  return <NavLinks pathname={pathname} searchParams={searchParams} {...rest} />;
}

/** Isolated Suspense for `useSearchParams` — avoids layout-wide sync commits during nav. */
export function NavLinksSuspense({
  pathname,
  ...rest
}: Omit<ComponentProps<typeof NavLinks>, "searchParams">) {
  return (
    <Suspense
      fallback={<NavLinks pathname={pathname} searchParams={EMPTY_SEARCH_PARAMS} {...rest} />}
    >
      <NavLinksWithSearchParams pathname={pathname} {...rest} />
    </Suspense>
  );
}
