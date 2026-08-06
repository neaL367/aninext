"use client";

import { SlidersHorizontalIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { FilterSidebar } from "./filter-sidebar";

import type { AnimeCollection } from "@/features/anime/types/anime";

export function MobileFilterDrawer({
  genresPromise,
  collection,
}: {
  genresPromise: Promise<string[]>;
  collection?: AnimeCollection;
}) {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();

  const activeFilterCount = [
    searchParams.get("genre"),
    ...searchParams.getAll("format"),
    ...searchParams.getAll("status"),
    searchParams.get("country"),
    searchParams.get("search"),
    searchParams.get("isAdult"),
  ].filter(Boolean).length;

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
        {activeFilterCount > 0 && (
          <span className="ml-1.5 flex size-5 items-center justify-center bg-signal text-[10px] font-semibold text-accent-foreground">
            {activeFilterCount}
          </span>
        )}
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[min(22rem,calc(100vw-2rem))] overflow-y-auto bg-background"
      >
        <SheetHeader className="border-b border-border-soft pb-4 text-left">
          <SheetTitle className="font-mono text-sm uppercase tracking-[0.14em]">Filters</SheetTitle>
          <SheetDescription>Refine results without leaving this view.</SheetDescription>
        </SheetHeader>
        <div className="px-4 py-6">
          <FilterSidebar genresPromise={genresPromise} mobile collection={collection} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
