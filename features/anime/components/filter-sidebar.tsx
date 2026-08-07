"use client";

import { ChevronDownIcon } from "lucide-react";
import { memo, use, useCallback, useMemo, useState } from "react";

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

import { useFilters, type FilterController } from "../hooks/use-filters";
import {
  FILTER_ADULT_GENRES,
  FILTER_COUNTRIES,
  FILTER_FORMATS,
  FILTER_SEASONS,
  FILTER_STATUSES,
  formatFilterValue,
  getYears,
} from "../lib/filter-constants";
import { FilterOptionGrid } from "./filter-button";

import type { AnimeCollection } from "@/features/anime/types/anime";

type OptionFilterKey = "genre" | "format" | "status" | "season" | "year" | "country";

type FilterOptionSectionProps = {
  filterKey: OptionFilterKey;
  label: string;
  options: readonly { value: string; label: string }[];
  selected: readonly string[];
  defaultOpen?: boolean;
  scroll?: boolean;
  multiple: boolean;
  updateFilter: (key: OptionFilterKey, value: string | string[] | undefined) => void;
};

const FORMAT_OPTIONS = FILTER_FORMATS.map((value) => ({
  value,
  label: formatFilterValue(value),
}));

const STATUS_OPTIONS = FILTER_STATUSES.map((value) => ({
  value,
  label: formatFilterValue(value),
}));

const SEASON_OPTIONS = [{ value: "", label: "Any" }, ...FILTER_SEASONS];

const COUNTRY_OPTIONS = [{ value: "", label: "Any" }, ...FILTER_COUNTRIES];

export function FilterSidebar({
  genresPromise,
  mobile = false,
  collection,
}: {
  genresPromise: Promise<string[]>;
  mobile?: boolean;
  collection: AnimeCollection;
}) {
  const filters = useFilters();

  return (
    <FilterSidebarContent
      genresPromise={genresPromise}
      mobile={mobile}
      collection={collection}
      filters={filters}
    />
  );
}

export function FilterSidebarContent({
  genresPromise,
  mobile = false,
  collection,
  filters,
}: {
  genresPromise: Promise<string[]>;
  mobile?: boolean;
  collection: AnimeCollection;
  filters: FilterController;
}) {
  const allGenres = use(genresPromise);
  const { state, isPending, updateFilter, clearAll, facetCount } = filters;
  const [adultOpen, setAdultOpen] = useState(false);
  const setAdultContent = useCallback(
    (enabled: boolean) => updateFilter("isAdult", enabled ? "true" : undefined),
    [updateFilter],
  );

  const genres = useMemo(
    () =>
      (state.isAdult
        ? allGenres
        : allGenres.filter(
            (genre) => !FILTER_ADULT_GENRES.some((adultGenre) => adultGenre === genre),
          )
      ).map((value) => ({ value, label: value })),
    [allGenres, state.isAdult],
  );
  const years = useMemo(
    () => [
      { value: "", label: "Any" },
      ...getYears().map((value) => ({ value: String(value), label: String(value) })),
    ],
    [],
  );

  const sections: Array<{
    key: OptionFilterKey;
    label: string;
    options: readonly { value: string; label: string }[];
    selected: readonly string[];
    defaultOpen?: boolean;
    scroll?: boolean;
  }> = [
    {
      key: "genre",
      label: "Genre",
      options: genres,
      selected: state.genre,
      defaultOpen: true,
      scroll: true,
    },
    {
      key: "format",
      label: "Format",
      options: FORMAT_OPTIONS,
      selected: state.format,
    },
    {
      key: "status",
      label: "Status",
      options: STATUS_OPTIONS,
      selected: state.status,
    },
    {
      key: "season",
      label: "Season",
      options: SEASON_OPTIONS,
      selected: [state.season],
      defaultOpen: collection === "seasonal" || Boolean(state.season),
    },
    {
      key: "year",
      label: "Year",
      options: years,
      selected: [state.year],
      defaultOpen: collection === "seasonal" || Boolean(state.year),
      scroll: true,
    },
    {
      key: "country",
      label: "Origin",
      options: COUNTRY_OPTIONS,
      selected: [state.country],
    },
  ];

  return (
    <aside
      className={cn(
        mobile ? "flex w-full" : "hidden w-full lg:flex",
        "flex-col transition-opacity data-[pending]:opacity-60",
      )}
      data-pending={isPending ? "" : undefined}
    >
      {mobile ? (
        facetCount > 0 && (
          <div className="mb-3 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="h-8 rounded-none px-2 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-muted-foreground"
            >
              Reset filters
            </Button>
          </div>
        )
      ) : (
        <div className="mb-3 flex items-center justify-between border-b border-border-soft pb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-foreground">
              Filters
            </span>
            {facetCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-accent font-mono text-[0.6rem] font-semibold text-accent-foreground">
                {facetCount}
              </span>
            )}
          </div>
          {facetCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="h-8 rounded-none px-2 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground"
            >
              Reset
            </Button>
          )}
        </div>
      )}

      <div className="flex flex-col">
        {sections.map((section) => (
          <FilterOptionSection
            key={section.key}
            filterKey={section.key}
            label={section.label}
            options={section.options}
            selected={section.selected}
            defaultOpen={section.defaultOpen}
            scroll={section.scroll}
            multiple={
              section.key === "genre" || section.key === "format" || section.key === "status"
            }
            updateFilter={updateFilter}
          />
        ))}
        <AdultContentFilter
          enabled={state.isAdult}
          open={adultOpen}
          onOpenChange={setAdultOpen}
          onChange={setAdultContent}
        />
      </div>

      {mobile && facetCount > 0 && (
        <p className="mt-4 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted-foreground">
          {facetCount} active {facetCount === 1 ? "filter" : "filters"}
        </p>
      )}
    </aside>
  );
}

const FilterOptionSection = memo(function FilterOptionSection({
  filterKey,
  label,
  options,
  selected,
  defaultOpen = false,
  scroll = false,
  multiple,
  updateFilter,
}: FilterOptionSectionProps) {
  const count = multiple ? selected.length : Number(Boolean(selected[0]));
  const onToggle = useCallback(
    (value: string) => {
      if (!multiple) {
        updateFilter(filterKey, value || undefined);
        return;
      }
      const next = selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value];
      updateFilter(filterKey, next.length ? next : undefined);
    },
    [filterKey, multiple, selected, updateFilter],
  );

  return (
    <FilterSection id={filterKey} label={label} defaultOpen={defaultOpen} count={count}>
      <FilterOptionGrid options={options} selected={selected} onToggle={onToggle} scroll={scroll} />
    </FilterSection>
  );
}, areFilterOptionsEqual);

function areFilterOptionsEqual(previous: FilterOptionSectionProps, next: FilterOptionSectionProps) {
  return (
    previous.filterKey === next.filterKey &&
    previous.label === next.label &&
    previous.defaultOpen === next.defaultOpen &&
    previous.scroll === next.scroll &&
    previous.multiple === next.multiple &&
    previous.updateFilter === next.updateFilter &&
    sameOptions(previous.options, next.options) &&
    sameValues(previous.selected, next.selected)
  );
}

function sameOptions(
  previous: readonly { value: string; label: string }[],
  next: readonly { value: string; label: string }[],
) {
  return (
    previous.length === next.length &&
    previous.every(
      (option, index) => option.value === next[index]?.value && option.label === next[index]?.label,
    )
  );
}

function sameValues(previous: readonly string[], next: readonly string[]) {
  return previous.length === next.length && previous.every((value, index) => value === next[index]);
}

function FilterSection({
  id,
  label,
  children,
  defaultOpen = false,
  count,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  count?: number;
}) {
  const [toggled, setToggled] = useState<boolean | null>(null);
  const open = toggled ?? ((count ?? 0) > 0 ? true : defaultOpen);
  const contentId = `filter-${id}-content`;

  return (
    <section className="border-b border-border-soft py-3">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setToggled(!open)}
        className="flex min-h-9 w-full items-center gap-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
      >
        <ChevronDownIcon className={cn("size-3.5 transition-transform", open && "rotate-180")} />
        <span className="font-mono text-[0.68rem] font-medium uppercase tracking-[0.08em] text-foreground">
          {label}
        </span>
        {count !== undefined && count > 0 && (
          <span className="ml-auto font-mono text-[0.62rem] text-accent">{count}</span>
        )}
      </button>
      {open && (
        <div id={contentId} className="pt-3">
          {children}
        </div>
      )}
    </section>
  );
}

function AdultContentFilter({
  enabled,
  open,
  onOpenChange,
  onChange,
}: {
  enabled: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (enabled: boolean) => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <section className="border-b border-border-soft py-3">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
        className="flex min-h-9 w-full items-center gap-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
      >
        <ChevronDownIcon className={cn("size-3.5 transition-transform", open && "rotate-180")} />
        <span className="font-mono text-[0.68rem] font-medium uppercase tracking-[0.08em] text-foreground">
          Adult content
        </span>
        {enabled && (
          <span className="ml-auto rounded-sm bg-live-badge/10 px-1.5 py-0.5 font-mono text-[0.6rem] font-medium text-live-badge">
            Enabled
          </span>
        )}
      </button>
      {open && (
        <div className="flex flex-col gap-3 pt-3">
          <p className="text-xs leading-5 text-muted-foreground">
            Includes mature themes and graphic material. Age confirmation required.
          </p>
          <div className="flex min-h-9 items-center justify-between gap-4">
            <span className="text-xs text-muted-foreground">Show adult content</span>
            <Switch
              checked={enabled}
              onCheckedChange={(checked: boolean) => {
                if (checked) setConfirmOpen(true);
                else onChange(false);
              }}
            />
          </div>
        </div>
      )}
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
                onChange(true);
              }}
            >
              I am 18 or older
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

export function FilterSidebarSkeleton() {
  return (
    <aside className="hidden w-full flex-col gap-2 lg:flex">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="border-b border-border-soft py-3">
          <Skeleton className="h-5 w-24 rounded" />
        </div>
      ))}
    </aside>
  );
}
