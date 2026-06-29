"use client";

import { SearchIcon, SlidersHorizontalIcon } from "lucide-react";
import { AdvancedFilters } from "@/components/browse/advanced-filters";
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
import { countBrowseFilters } from "@/lib/routes/search-params";
import {
  getActiveFilterChips,
  type AnimeListParams,
} from "@/lib/routes/search-params";

type GenreOption = { id: number; name: string };

type AnimeBrowseToolbarProps = {
  filterParams: AnimeListParams;
  searchInput: string;
  onSearchChange: (value: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  genres: GenreOption[];
  onApply: (params: AnimeListParams) => void;
  onReset: () => void;
  isSearching?: boolean;
};

export function AnimeBrowseToolbar({
  filterParams,
  searchInput,
  onSearchChange,
  searchInputRef,
  genres,
  onApply,
  onReset,
  isSearching = false,
}: AnimeBrowseToolbarProps) {
  const filterCount = countBrowseFilters(filterParams);
  const hasChips = getActiveFilterChips(filterParams).length > 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            id="anime-search"
            type="search"
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search anime..."
            autoComplete="off"
            className="h-9 pl-9"
            aria-busy={isSearching}
          />
        </div>

        <Sheet>
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
          <SheetContent side="right" className="w-full gap-0 overflow-y-auto p-0 sm:max-w-md">
            <SheetHeader className="border-b border-border">
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>
                Toggles apply instantly. Sliders update when you release.
              </SheetDescription>
            </SheetHeader>
            <div className="p-4">
              <AdvancedFilters
                params={filterParams}
                genres={genres}
                onApply={onApply}
                onReset={onReset}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <AnimeQuickFilters params={filterParams} onChange={onApply} />

      {hasChips ? (
        <FilterChips params={filterParams} onChange={onApply} onClearAll={onReset} />
      ) : null}
    </div>
  );
}
