import type { Metadata } from "next";
import { BrowsePageShell, BrowsePageResults } from "@/features/anime/components/browse-page-shell";
import { parseFilters } from "@/features/anime/lib/parse-filters";
import { getCollectionMetadata } from "@/features/anime/lib/collection-config";

export const prefetch = "partial";
export const instant = false;

export function generateMetadata(): Metadata {
  return getCollectionMetadata("popular");
}

export default function PopularPage({
  searchParams,
}: PageProps<"/anime/popular">) {
  return (
    <BrowsePageShell collection="popular">
      {searchParams.then((sp) => {
        const filters = parseFilters(sp as Record<string, string | string[] | undefined>);
        return <BrowsePageResults collection="popular" filters={filters} />;
      })}
    </BrowsePageShell>
  );
}
