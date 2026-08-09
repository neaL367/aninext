"use client";

import { ArrowUpRightIcon } from "lucide-react";
import { usePathname } from "next/navigation";

import { HoverPrefetchLink } from "@/components/ui/hover-prefetch-link";
import { COLLECTION_NAV_ITEMS } from "@/features/anime/lib/collection-config";
import { cn } from "@/lib/utils";

import type { AnimeCollection } from "@/features/anime/types/anime";

export function CollectionNav() {
  "use memo";
  const pathname = usePathname();
  const active = pathname.split("/")[2] as AnimeCollection;

  return (
    <nav
      className="flex items-center gap-1 overflow-x-auto border-b border-border-soft scrollbar-none"
      aria-label="Anime collections"
    >
      {COLLECTION_NAV_ITEMS.map(({ id, label }) => {
        const isActive = id === active || (id === "trending" && pathname === "/anime");
        return (
          <HoverPrefetchLink
            key={id}
            href={`/anime/${id}`}
            prefetch={id === "seasonal" ? false : undefined}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group relative flex shrink-0 items-center gap-2 px-3 pb-3 pt-1 text-sm transition-colors",
              isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
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
