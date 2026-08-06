"use client";

import { ChevronDownIcon } from "lucide-react";
import { use, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import { useFilters } from "../../hooks/use-filters";
import {
  FILTER_FORMATS,
  FILTER_STATUSES,
  FILTER_COUNTRIES,
  FILTER_SEASONS,
  FILTER_ADULT_GENRES,
  getYears,
  formatFilterValue,
} from "../../lib/filter-constants";
import { FilterButton } from "./filter-button";

import type { AnimeCollection } from "@/features/anime/types/anime";

export function FilterSidebar({
  genresPromise,
  mobile = false,
  collection,
}: {
  genresPromise: Promise<string[]>;
  mobile?: boolean;
  collection?: AnimeCollection;
}) {
  const allGenres = use(genresPromise);
  const {
    isPending,
    updateFilter,
    clearAll,
    activeCount,
    currentGenres,
    currentFormats,
    currentStatuses,
    currentSeason,
    currentYear,
    currentCountry,
    isAdult,
  } = useFilters();

  const [adultOpen, setAdultOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const genres = isAdult ? allGenres : allGenres.filter((g) => !FILTER_ADULT_GENRES.includes(g));

  const seasonDefault = collection === "seasonal" || !!currentSeason;
  const yearDefault = collection === "seasonal" || !!currentYear;

  return (
    <aside
      className={cn(mobile ? "flex w-full" : "hidden w-full lg:flex", "flex-col")}
      data-pending={isPending ? "" : undefined}
    >
      <div className="mb-3 flex items-center justify-between border-b border-border-soft pb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-foreground">
            Filters
          </span>
          {activeCount > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-accent font-mono text-[0.6rem] font-semibold text-accent-foreground">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="h-6 rounded-none px-2 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground"
          >
            Reset
          </Button>
        )}
      </div>

      <div className="space-y-0">
        <FilterSection label="Genre" defaultOpen count={currentGenres.length}>
          <div className="flex flex-wrap gap-1.5">
            {genres.map((genre) => {
              const active = currentGenres.includes(genre);
              return (
                <FilterButton
                  key={genre}
                  active={active}
                  onClick={() => {
                    const next = active
                      ? currentGenres.filter((g) => g !== genre)
                      : [...currentGenres, genre];
                    updateFilter("genre", next.length ? next : undefined);
                  }}
                >
                  {genre}
                </FilterButton>
              );
            })}
          </div>
        </FilterSection>

        <FilterSection label="Format" count={currentFormats.length}>
          <div className="flex flex-wrap gap-1.5">
            {FILTER_FORMATS.map((format) => {
              const active = currentFormats.includes(format);
              return (
                <FilterButton
                  key={format}
                  active={active}
                  onClick={() => {
                    const next = active
                      ? currentFormats.filter((f) => f !== format)
                      : [...currentFormats, format];
                    updateFilter("format", next.length ? next : undefined);
                  }}
                >
                  {formatFilterValue(format)}
                </FilterButton>
              );
            })}
          </div>
        </FilterSection>

        <FilterSection label="Status" count={currentStatuses.length}>
          <div className="flex flex-wrap gap-1.5">
            {FILTER_STATUSES.map((status) => {
              const active = currentStatuses.includes(status);
              return (
                <FilterButton
                  key={status}
                  active={active}
                  onClick={() => {
                    const next = active
                      ? currentStatuses.filter((s) => s !== status)
                      : [...currentStatuses, status];
                    updateFilter("status", next.length ? next : undefined);
                  }}
                >
                  {formatFilterValue(status)}
                </FilterButton>
              );
            })}
          </div>
        </FilterSection>

        <FilterSection label="Season" defaultOpen={seasonDefault} count={currentSeason ? 1 : 0}>
          <div className="flex flex-wrap gap-1.5">
            <FilterButton active={!currentSeason} onClick={() => updateFilter("season", undefined)}>
              Any
            </FilterButton>
            {FILTER_SEASONS.map((s) => (
              <FilterButton
                key={s.value}
                active={currentSeason === s.value}
                onClick={() => updateFilter("season", s.value)}
              >
                {s.label}
              </FilterButton>
            ))}
          </div>
        </FilterSection>

        <FilterSection label="Year" defaultOpen={yearDefault} count={currentYear ? 1 : 0}>
          <div className="flex flex-wrap gap-1.5">
            <FilterButton active={!currentYear} onClick={() => updateFilter("year", undefined)}>
              Any
            </FilterButton>
            {getYears().map((y) => (
              <FilterButton
                key={y}
                active={currentYear === String(y)}
                onClick={() => updateFilter("year", String(y))}
              >
                {y}
              </FilterButton>
            ))}
          </div>
        </FilterSection>

        <FilterSection label="Origin" count={currentCountry ? 1 : 0}>
          <div className="flex flex-wrap gap-1.5">
            <FilterButton
              active={!currentCountry}
              onClick={() => updateFilter("country", undefined)}
            >
              All
            </FilterButton>
            {FILTER_COUNTRIES.map((country) => (
              <FilterButton
                key={country.value}
                active={currentCountry === country.value}
                onClick={() => updateFilter("country", country.value)}
              >
                {country.label}
              </FilterButton>
            ))}
          </div>
        </FilterSection>

        <div className="border-b border-border-soft py-3">
          <button
            type="button"
            onClick={() => setAdultOpen(!adultOpen)}
            className="flex w-full items-center gap-2 text-left"
          >
            <ChevronDownIcon
              className={cn("size-3.5 transition-transform", adultOpen && "rotate-180")}
            />
            <span className="font-mono text-[0.65rem] font-medium text-foreground">
              Adult content
            </span>
            {isAdult && (
              <span className="ml-auto rounded-sm bg-live-badge/10 px-1.5 py-0.5 font-mono text-[0.6rem] font-medium text-live-badge">
                Enabled
              </span>
            )}
          </button>
          {adultOpen && (
            <div className="mt-3 space-y-3">
              <p className="text-xs leading-5 text-muted-foreground">
                This includes mature themes and graphic material. You must be 18 years or older to
                view adult content.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Enable adult content</span>
                <Switch
                  checked={isAdult}
                  onCheckedChange={(checked: boolean) => {
                    if (checked) {
                      setConfirmOpen(true);
                    } else {
                      updateFilter("isAdult", undefined);
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Age confirmation</AlertDialogTitle>
            <AlertDialogDescription>
              This content is intended for mature audiences and may include graphic material. You
              must be 18 years or older to view adult content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmOpen(false);
                updateFilter("isAdult", "true");
              }}
            >
              I am 18 or older
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  );
}

function FilterSection({
  label,
  children,
  defaultOpen = false,
  count,
}: {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  count?: number;
}) {
  const [toggled, setToggled] = useState<boolean | null>(null);
  const open = toggled ?? ((count ?? 0) > 0 ? true : defaultOpen);

  return (
    <div className="border-b border-border-soft py-3">
      <button
        type="button"
        onClick={() => setToggled(!open)}
        className="flex w-full items-center gap-2 text-left"
      >
        <ChevronDownIcon className={cn("size-3.5 transition-transform", open && "rotate-180")} />
        <span className="font-mono text-[0.65rem] font-medium text-foreground">{label}</span>
        {count !== undefined && count > 0 && (
          <span className="ml-auto font-mono text-[0.6rem] text-accent">{count}</span>
        )}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

export function FilterSidebarSkeleton() {
  return (
    <aside className="hidden w-full flex-col gap-1 lg:flex">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="border-b border-border py-2">
          <Skeleton className="h-5 w-20 rounded" />
        </div>
      ))}
    </aside>
  );
}
