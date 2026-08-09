import { CalendarIcon, FilterIcon, SearchIcon } from "lucide-react";

import { EmptyState } from "./empty-state";

export function EmptySearch() {
  "use memo";
  return (
    <EmptyState
      icon={SearchIcon}
      title="No results found"
      description="Try adjusting your search terms or filters to find what you're looking for."
    />
  );
}

export function EmptyFilters() {
  "use memo";
  return (
    <EmptyState
      icon={FilterIcon}
      title="No results match these filters"
      description="Try removing some filters or adjusting your search criteria."
    />
  );
}

export function EmptyUpcoming() {
  "use memo";
  return (
    <EmptyState
      icon={CalendarIcon}
      title="No upcoming anime announced"
      description="Check back later for new announcements."
    />
  );
}
