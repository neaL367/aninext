"use client";

import { SlidersHorizontalIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
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
  const { facetCount } = useFilterState();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="h-10 rounded-none border-border-soft font-mono text-[0.62rem] uppercase tracking-[0.1em] lg:hidden"
          />
        }
      >
        <SlidersHorizontalIcon className="size-4" />
        Filters
        {facetCount > 0 && (
          <span className="ml-1.5 flex size-5 items-center justify-center bg-signal text-[10px] font-semibold text-accent-foreground">
            {facetCount}
          </span>
        )}
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[min(25rem,calc(100vw-1rem))] overflow-y-auto bg-background"
      >
        <SheetHeader className="border-b border-border-soft pb-4 text-left">
          <SheetTitle className="font-mono text-sm uppercase tracking-[0.14em]">Filters</SheetTitle>
          <SheetDescription>Refine results without leaving this view.</SheetDescription>
        </SheetHeader>
        <div className="px-4 py-4">
          <FilterSidebarContent
            genresPromise={genresPromise}
            mobile
            collection={collection}
            state={useFilterState()}
            actions={useFilterActions()}
          />
        </div>
        <SheetFooter className="sticky bottom-0 border-t border-border-soft bg-background/95 p-4 backdrop-blur-xl">
          <SheetClose
            render={
              <Button className="w-full rounded-none font-mono text-[0.65rem] uppercase tracking-[0.12em]" />
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
