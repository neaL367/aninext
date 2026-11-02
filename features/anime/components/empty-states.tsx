import { CalendarIcon, FilterIcon, SearchIcon } from "lucide-react";

import { EmptyState } from "./empty-state";

export function EmptySearch() {
  "use memo";
  return <EmptyState icon={SearchIcon} title="No results" />;
}

export function EmptyFilters() {
  "use memo";
  return <EmptyState icon={FilterIcon} title="No results match these filters" />;
}

export function EmptyUpcoming() {
  "use memo";
  return <EmptyState icon={CalendarIcon} title="No upcoming anime announced" />;
}
