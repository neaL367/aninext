"use client";

import { ChevronDownIcon } from "lucide-react";
import { memo, use, useCallback, useMemo, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { useFilterActions } from "../hooks/use-filter-actions";
import { useFilterState } from "../hooks/use-filter-state";
import {
  FILTER_ADULT_GENRES,
  FILTER_COUNTRIES,
  FILTER_FORMATS,
  FILTER_SEASONS,
  FILTER_STATUSES,
  formatFilterValue,
  getYears,
  isMultiFilter,
  type FacetFilterKey,
} from "../lib/filter-constants";
import { AdultContentFilter } from "./adult-content-filter";
import { FilterOptionGrid } from "./filter-button";
import { FiltersHeader } from "./filters-header";

import type { AnimeCollection } from "@/features/anime/types/anime";

type OptionFilterKey = FacetFilterKey;

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
  "use memo";
  const state = useFilterState();
  const actions = useFilterActions();

  return (
    <FilterSidebarContent
      genresPromise={genresPromise}
      mobile={mobile}
      collection={collection}
      state={state}
      actions={actions}
    />
  );
}

export function FilterSidebarContent({
  genresPromise,
  mobile = false,
  collection,
  state,
  actions,
}: {
  genresPromise: Promise<string[]>;
  mobile?: boolean;
  collection: AnimeCollection;
  state: ReturnType<typeof useFilterState>;
  actions: ReturnType<typeof useFilterActions>;
}) {
  "use memo";
  const allGenres = use(genresPromise);
  const { state: filterState, isPending, facetCount } = state;
  const { updateFilter, clearAll } = actions;
  const [adultOpen, setAdultOpen] = useState(false);
  const setAdultContent = useCallback(
    (enabled: boolean) => updateFilter("isAdult", enabled ? "true" : undefined),
    [updateFilter],
  );

  const genres = useMemo(
    () =>
      (filterState.isAdult
        ? allGenres
        : allGenres.filter(
            (genre) => !FILTER_ADULT_GENRES.some((adultGenre) => adultGenre === genre),
          )
      ).map((value) => ({ value, label: value })),
    [allGenres, filterState.isAdult],
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
      selected: filterState.genre,
      defaultOpen: true,
      scroll: true,
    },
    {
      key: "format",
      label: "Format",
      options: FORMAT_OPTIONS,
      selected: filterState.format,
    },
    ...(collection !== "upcoming"
      ? [
          {
            key: "status" as const,
            label: "Status",
            options: STATUS_OPTIONS,
            selected: filterState.status,
          },
        ]
      : []),
    {
      key: "season",
      label: "Season",
      options: SEASON_OPTIONS,
      selected: [filterState.season],
      defaultOpen: Boolean(filterState.season),
    },
    {
      key: "year",
      label: "Year",
      options: years,
      selected: [filterState.year],
      defaultOpen: Boolean(filterState.year),
      scroll: true,
    },
    {
      key: "country",
      label: "Origin",
      options: COUNTRY_OPTIONS,
      selected: [filterState.country],
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
      <FiltersHeader facetCount={facetCount} onClear={clearAll} mobile={mobile} />

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
            multiple={isMultiFilter(section.key)}
            updateFilter={updateFilter}
          />
        ))}
        <AdultContentFilter
          enabled={filterState.isAdult}
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
  "use memo";
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
