"use client";

import type { Route } from "next";
import { usePathname } from "next/navigation";
import { ArrowUpRightIcon } from "lucide-react";
import { HoverPrefetchLink } from "@/components/hover-prefetch-link";
import type { AnimeCollection } from "@/features/anime/types/anime";
import { COLLECTION_NAV_ITEMS } from "@/features/anime/lib/collection-config";
import { cn } from "@/lib/utils";

export function CollectionNav() {
  const pathname = usePathname();
  const active = pathname.split("/")[2] as AnimeCollection;

  return (
    <nav className="flex items-center gap-1 overflow-x-auto border-b border-border-soft scrollbar-none" aria-label="Anime collections">
      {COLLECTION_NAV_ITEMS.map(({ id, label }) => {
        const isActive = id === active || (id === "trending" && pathname === "/anime");
        return (
          <HoverPrefetchLink
            key={id}
            href={`/anime/${id}` as Route<string>}
            className={cn(
              "group relative flex shrink-0 items-center gap-2 px-3 pb-3 pt-1 text-sm transition-colors",
              isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
            {isActive && <span className="absolute inset-x-3 -bottom-px h-px bg-signal" />}
            <ArrowUpRightIcon className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
          </HoverPrefetchLink>
        );
      })}
    </nav>
  );
}
