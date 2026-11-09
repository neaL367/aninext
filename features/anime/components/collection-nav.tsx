"use client";

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
      className="no-scrollbar flex items-center gap-6 overflow-x-auto border-b border-border-soft max-sm:[mask-image:linear-gradient(to_right,black_86%,transparent)]"
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
              "relative flex min-h-11 shrink-0 items-center pb-3 pt-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] transition-colors",
              isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
            {isActive && (
              <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-signal" />
            )}
          </HoverPrefetchLink>
        );
      })}
    </nav>
  );
}
