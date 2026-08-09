"use client";

export { useFilterActions } from "./use-filter-actions";
export { useFilterState } from "./use-filter-state";
export type { ActiveFilter } from "./use-filter-state";

import { useFilterActions } from "./use-filter-actions";
import { useFilterState } from "./use-filter-state";

/**
 * @deprecated Use useFilterState() + useFilterActions() separately for better performance.
 * This combined hook causes all consumers to re-render on every URL change.
 */
export function useFilters() {
  const state = useFilterState();
  const actions = useFilterActions();
  return { ...state, ...actions };
}

export type FilterController = ReturnType<typeof useFilters>;
