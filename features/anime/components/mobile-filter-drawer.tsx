"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SlidersHorizontalIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { FilterSidebar } from "./filter-sidebar";

export function MobileFilterDrawer({
  genresPromise,
}: {
  genresPromise: Promise<string[]>;
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
            className="rounded-full lg:hidden"
          />
        }
      >
        <SlidersHorizontalIcon className="size-4" />
        Filters
        {activeFilterCount > 0 && (
          <span className="ml-1.5 flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-accent-foreground">
            {activeFilterCount}
          </span>
        )}
      </SheetTrigger>
      <SheetContent side="left" className="w-[min(22rem,calc(100vw-2rem))] overflow-y-auto">
        <SheetHeader className="border-b border-border-soft pb-4 text-left">
          <SheetTitle className="text-lg">Filters</SheetTitle>
          <SheetDescription>
            Refine your anime search results
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 py-6">
          <FilterSidebar genresPromise={genresPromise} mobile />
        </div>
      </SheetContent>
    </Sheet>
  );
}
