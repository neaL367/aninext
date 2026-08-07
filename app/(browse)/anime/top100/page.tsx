import { Suspense } from "react";

import { BrowsePageResults } from "@/features/anime/components/browse-page-shell";
import { MediaGridSkeleton } from "@/features/anime/components/media-grid";
import { getCollectionMetadata } from "@/features/anime/lib/collection-config";
import { parseFilters } from "@/features/anime/lib/parse-filters";

import type { Metadata } from "next";

export function generateMetadata(): Metadata {
  return getCollectionMetadata("top100");
}

export default function Top100Page({ searchParams }: PageProps<"/anime/top100">) {
  return (
    <Suspense fallback={<MediaGridSkeleton count={20} />}>
      {searchParams.then((sp) => (
        <BrowsePageResults collection="top100" filters={parseFilters(sp)} />
      ))}
    </Suspense>
  );
}
