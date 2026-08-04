import type { Metadata } from "next";
import { BrowsePageShell, BrowsePageResults } from "@/features/anime/components/browse-page-shell";
import { parseFilters } from "@/features/anime/lib/parse-filters";
import { getCollectionMetadata } from "@/features/anime/lib/collection-config";

export const prefetch = "partial";
export const instant = false;

export function generateMetadata(): Metadata {
  return getCollectionMetadata("upcoming");
}

export default function UpcomingPage({
  searchParams,
}: PageProps<"/anime/upcoming">) {
  return (
    <BrowsePageShell collection="upcoming">
      {searchParams.then((sp) => {
        const filters = parseFilters(sp as Record<string, string | string[] | undefined>);
        return <BrowsePageResults collection="upcoming" filters={filters} />;
      })}
    </BrowsePageShell>
  );
}
