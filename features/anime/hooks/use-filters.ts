"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useMemo, useCallback } from "react";

import { formatFilterValue } from "../lib/filter-constants";

export interface ActiveFilter {
  key: string;
  label: string;
  value?: string;
}

export function useFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateFilter = useCallback(
    (key: string, value: string | string[] | undefined) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams);
        params.delete(key);
        if (value) {
          if (Array.isArray(value)) {
            value.forEach((item) => params.append(key, item));
          } else {
            params.set(key, value);
          }
        }
        router.replace(`?${params.toString()}`, { scroll: false });
      });
    },
    [searchParams, router],
  );

  const removeFilter = useCallback(
    (key: string, value?: string) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams);
        if (value) {
          const values = params.getAll(key).filter((v) => v !== value);
          params.delete(key);
          values.forEach((v) => params.append(key, v));
        } else {
          params.delete(key);
        }
        router.replace(`?${params.toString()}`, { scroll: false });
      });
    },
    [searchParams, router],
  );

  const clearAll = useCallback(() => {
    startTransition(() => {
      router.replace("?", { scroll: false });
    });
  }, [router]);

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = [];
    const search = searchParams.get("search");
    if (search) filters.push({ key: "search", label: search });
    searchParams.getAll("genre").forEach((g) => filters.push({ key: "genre", label: g, value: g }));
    searchParams
      .getAll("format")
      .forEach((f) => filters.push({ key: "format", label: formatFilterValue(f), value: f }));
    searchParams
      .getAll("status")
      .forEach((s) => filters.push({ key: "status", label: formatFilterValue(s), value: s }));
    const season = searchParams.get("season");
    if (season)
      filters.push({ key: "season", label: season.charAt(0) + season.slice(1).toLowerCase() });
    const year = searchParams.get("year");
    if (year) filters.push({ key: "year", label: year });
    const country = searchParams.get("country");
    if (country) filters.push({ key: "country", label: country });
    const isAdult = searchParams.get("isAdult");
    if (isAdult === "true") filters.push({ key: "isAdult", label: "18+" });
    return filters;
  }, [searchParams]);

  const groupedFilters = useMemo(() => {
    const groups: Record<string, ActiveFilter[]> = {};
    activeFilters.forEach((f) => {
      if (!groups[f.key]) groups[f.key] = [];
      groups[f.key].push(f);
    });
    return groups;
  }, [activeFilters]);

  const currentGenres = searchParams.getAll("genre");
  const currentFormats = searchParams.getAll("format");
  const currentStatuses = searchParams.getAll("status");
  const currentSeason = searchParams.get("season") ?? "";
  const currentYear = searchParams.get("year") ?? "";
  const currentCountry = searchParams.get("country") ?? "";
  const isAdult = searchParams.get("isAdult") === "true";

  const activeCount =
    currentGenres.length +
    currentFormats.length +
    currentStatuses.length +
    (currentSeason ? 1 : 0) +
    (currentYear ? 1 : 0) +
    (currentCountry ? 1 : 0) +
    (isAdult ? 1 : 0);

  return {
    isPending,
    updateFilter,
    removeFilter,
    clearAll,
    activeFilters,
    groupedFilters,
    activeCount,
    currentGenres,
    currentFormats,
    currentStatuses,
    currentSeason,
    currentYear,
    currentCountry,
    isAdult,
  };
}
