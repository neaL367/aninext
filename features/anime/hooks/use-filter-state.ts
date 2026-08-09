"use client";

import { useSearchParams } from "next/navigation";
import { useTransition, useMemo } from "react";

import {
  getFacetFilterCount,
  getFilterState,
  formatFilterValue,
  type FilterKey,
  type FilterState,
} from "../lib/filter-constants";

export interface ActiveFilter {
  key: FilterKey;
  label: string;
  value?: string;
}

export function useFilterState() {
  const searchParams = useSearchParams();
  const [isPending] = useTransition();
  const state = useMemo<FilterState>(() => getFilterState(searchParams), [searchParams]);

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = [];
    if (state.search) filters.push({ key: "search", label: state.search });
    state.genre.forEach((value) => filters.push({ key: "genre", label: value, value }));
    state.format.forEach((value) =>
      filters.push({ key: "format", label: formatFilterValue(value), value }),
    );
    state.status.forEach((value) =>
      filters.push({ key: "status", label: formatFilterValue(value), value }),
    );
    if (state.season) {
      filters.push({
        key: "season",
        label: state.season.charAt(0) + state.season.slice(1).toLowerCase(),
      });
    }
    if (state.year) filters.push({ key: "year", label: state.year });
    if (state.country) filters.push({ key: "country", label: state.country });
    if (state.isAdult) filters.push({ key: "isAdult", label: "18+" });
    return filters;
  }, [state]);

  const groupedFilters = useMemo(() => {
    const groups: Record<string, ActiveFilter[]> = {};
    activeFilters.forEach((f) => {
      if (!groups[f.key]) groups[f.key] = [];
      groups[f.key].push(f);
    });
    return groups;
  }, [activeFilters]);

  return {
    isPending,
    state,
    activeFilters,
    groupedFilters,
    facetCount: getFacetFilterCount(state),
  };
}
