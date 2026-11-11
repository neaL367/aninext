"use client";

import { SlidersHorizontalIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetTrigger,
} from "@/components/ui/sheet";

import { useFilterActions } from "../hooks/use-filter-actions";
import { useFilterState } from "../hooks/use-filter-state";
import { FilterSidebarContent } from "./filter-sidebar";

import type { AnimeCollection } from "@/features/anime/types/anime";

export function MobileFilterDrawer({
  genresPromise,
  collection,
}: {
  genresPromise: Promise<string[]>;
  collection: AnimeCollection;
}) {
  "use memo";
  const [open, setOpen] = useState(false);
  const state = useFilterState();
  const actions = useFilterActions();
  const { facetCount } = state;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="h-10 rounded-[2px] border-border-soft font-mono text-[0.8125rem] uppercase tracking-[0.14em] lg:hidden"
          />
        }
      >
        <SlidersHorizontalIcon className="size-3.5" />
        Filter
        {facetCount > 0 && (
          <span className="ml-1 font-mono text-[0.75rem] text-signal">{facetCount}</span>
        )}
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[min(24rem,calc(100vw-1rem))]! pb-[env(safe-area-inset-bottom)] overflow-y-auto bg-background"
      >
        <SheetHeader className="border-b border-border-soft pb-4 text-left">
          <SheetTitle className="font-mono text-[0.875rem] uppercase tracking-[0.16em]">
            Filter
          </SheetTitle>
        </SheetHeader>
        <div className="px-4 py-4">
          <FilterSidebarContent
            genresPromise={genresPromise}
            mobile
            collection={collection}
            state={state}
            actions={actions}
          />
        </div>
        <SheetFooter className="sticky bottom-0 border-t border-border-soft bg-background/95 p-4 backdrop-blur-xl">
          <SheetClose
            render={
              <Button className="w-full rounded-[2px] font-mono text-[0.8125rem] uppercase tracking-[0.14em]" />
            }
          >
            Done
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function MobileFilterDrawerFallback() {
  return <div className="h-10 w-24 border border-border-soft bg-surface-1/40" />;
}
