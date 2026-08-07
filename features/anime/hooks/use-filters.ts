"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useMemo, useCallback, useEffect, useRef } from "react";

import {
  getFacetFilterCount,
  getFilterState,
  type FilterKey,
  type FilterState,
} from "../lib/filter-constants";
import { formatFilterValue } from "../lib/filter-constants";

export interface ActiveFilter {
  key: FilterKey;
  label: string;
  value?: string;
}

type FilterValue = string | string[] | undefined;

export function useFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const pendingQuery = useRef<string | null>(null);
  const state = useMemo<FilterState>(() => getFilterState(searchParams), [searchParams]);

  useEffect(() => {
    pendingQuery.current = null;
  }, [searchParams]);

  const navigate = useCallback(
    (params: URLSearchParams) => {
      const query = params.toString();
      pendingQuery.current = query;
      startTransition(() => {
        router.replace(query ? `?${query}` : "?", { scroll: false });
      });
    },
    [router],
  );

  const updateFilter = useCallback(
    (key: FilterKey, value: FilterValue) => {
      const params = new URLSearchParams(pendingQuery.current ?? window.location.search);
      params.delete(key);
      if (value) {
        if (Array.isArray(value)) {
          value.forEach((item) => params.append(key, item));
        } else {
          params.set(key, value);
        }
      }
      navigate(params);
    },
    [navigate],
  );

  const removeFilter = useCallback(
    (key: FilterKey, value?: string) => {
      const params = new URLSearchParams(pendingQuery.current ?? window.location.search);
      if (value) {
        const values = params.getAll(key).filter((v) => v !== value);
        params.delete(key);
        values.forEach((v) => params.append(key, v));
      } else {
        params.delete(key);
      }
      navigate(params);
    },
    [navigate],
  );

  const clearAll = useCallback(() => {
    navigate(new URLSearchParams());
  }, [navigate]);

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
    updateFilter,
    removeFilter,
    clearAll,
    activeFilters,
    groupedFilters,
    facetCount: getFacetFilterCount(state),
  };
}

export type FilterController = ReturnType<typeof useFilters>;
