import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { SearchIcon, FilterIcon, CalendarIcon, InboxIcon } from "lucide-react";

export function EmptySearch() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchIcon />
        </EmptyMedia>
        <EmptyTitle>No results found</EmptyTitle>
      </EmptyHeader>
      <EmptyContent>
        <EmptyDescription>
          Try adjusting your search terms or filters to find what you&apos;re looking for.
        </EmptyDescription>
      </EmptyContent>
    </Empty>
  );
}

export function EmptyFilters() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FilterIcon />
        </EmptyMedia>
        <EmptyTitle>No results match these filters</EmptyTitle>
      </EmptyHeader>
      <EmptyContent>
        <EmptyDescription>
          Try removing some filters or adjusting your search criteria.
        </EmptyDescription>
      </EmptyContent>
    </Empty>
  );
}

export function EmptyUpcoming() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CalendarIcon />
        </EmptyMedia>
        <EmptyTitle>No upcoming anime announced</EmptyTitle>
      </EmptyHeader>
      <EmptyContent>
        <EmptyDescription>
          Check back later for new announcements.
        </EmptyDescription>
      </EmptyContent>
    </Empty>
  );
}

export function EmptyGeneric() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <InboxIcon />
        </EmptyMedia>
        <EmptyTitle>Nothing here yet</EmptyTitle>
      </EmptyHeader>
      <EmptyContent>
        <EmptyDescription>
          There&apos;s nothing to display at the moment.
        </EmptyDescription>
      </EmptyContent>
    </Empty>
  );
}
