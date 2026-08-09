"use client";

import { useRouter } from "next/navigation";
import { useTransition, useCallback } from "react";

import type { FilterKey } from "../lib/filter-constants";

type FilterValue = string | string[] | undefined;

export function useFilterActions() {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const navigate = useCallback(
    (params: URLSearchParams) => {
      const query = params.toString();
      startTransition(() => {
        router.replace(query ? `?${query}` : "?", { scroll: false });
      });
    },
    [router],
  );

  const updateFilter = useCallback(
    (key: FilterKey, value: FilterValue) => {
      const params = new URLSearchParams(window.location.search);
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
      const params = new URLSearchParams(window.location.search);
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

  return { updateFilter, removeFilter, clearAll };
}
