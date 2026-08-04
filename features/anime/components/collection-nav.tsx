"use client";

import type { Route } from "next";
import { usePathname } from "next/navigation";
import { HoverPrefetchLink } from "@/components/hover-prefetch-link";
import type { AnimeCollection } from "@/features/anime/types/anime";
import { COLLECTION_NAV_ITEMS } from "@/features/anime/lib/collection-config";
import { cn } from "@/lib/utils";

export function CollectionNav() {
  const pathname = usePathname();
  const active = pathname.split("/")[2] as AnimeCollection;

  return (
    <nav className="flex gap-1 overflow-x-auto scrollbar-none" aria-label="Anime collections">
      {COLLECTION_NAV_ITEMS.map(({ id, label }) => {
        const isActive = id === active;
        return (
          <HoverPrefetchLink
            key={id}
            href={`/anime/${id}` as Route<string>}
            className={cn(
              "relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-accent/10 text-accent"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {label}
            {isActive && (
              <span className="absolute inset-x-4 -bottom-px h-0.5 rounded-full bg-accent" />
            )}
          </HoverPrefetchLink>
        );
      })}
    </nav>
  );
}
