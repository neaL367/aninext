"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { SearchIcon, SlidersHorizontalIcon } from "lucide-react";
import { useBrowseFilters } from "@/components/browse/browse-filters-provider";
import { AnimeQuickFilters } from "@/components/browse/anime-quick-filters";
import { FilterChips } from "@/components/browse/filter-chips";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { countBrowseFilters, getActiveFilterChips } from "@/lib/browse/params";

const AdvancedFilters = dynamic(
  () => import("@/components/browse/advanced-filters").then((module) => module.AdvancedFilters),
  { ssr: false },
);

export function AnimeBrowseToolbar() {
  "use memo";

  const { state, actions, meta } = useBrowseFilters();
  const { params } = state;
  const { setSearchInput } = actions;
  const { searchRef } = meta;
  const [sheetOpen, setSheetOpen] = useState(false);
  const filterCount = countBrowseFilters(params);
  const hasChips = getActiveFilterChips(params).length > 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={searchRef}
            id="anime-search"
            type="search"
            value={params.q}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search anime..."
            autoComplete="off"
            className="h-9 pl-9"
          />
        </div>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger
            render={
              <Button variant="outline" size="sm" className="h-9 shrink-0 gap-1.5 px-3">
                <SlidersHorizontalIcon className="size-4" />
                <span className="hidden sm:inline">Filters</span>
                {filterCount > 0 ? (
                  <Badge variant="secondary" className="h-5 min-w-5 px-1 tabular-nums">
                    {filterCount}
                  </Badge>
                ) : null}
              </Button>
            }
          />
          <SheetContent side="right" className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-md">
            <SheetHeader className="shrink-0 border-b border-border">
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>
                Toggles apply instantly. Sliders update when you release.
              </SheetDescription>
            </SheetHeader>
            <div
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4"
              data-lenis-prevent
              data-lenis-prevent-wheel
            >
              {sheetOpen ? <AdvancedFilters /> : null}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <AnimeQuickFilters />

      {hasChips ? <FilterChips /> : null}
    </div>
  );
}
