import { Suspense } from "react";

import { BrowsePageResults } from "@/features/anime/components/browse-page-shell";
import { MediaGridSkeleton } from "@/features/anime/components/media-grid";
import { getCollectionMetadata } from "@/features/anime/lib/collection-config";
import { parseFilters } from "@/features/anime/lib/parse-filters";

import type { Metadata } from "next";

export function generateMetadata(): Metadata {
  return getCollectionMetadata("alltimepopular");
}

export default function AlltimepopularPage({ searchParams }: PageProps<"/anime/alltimepopular">) {
  return (
    <Suspense fallback={<MediaGridSkeleton count={20} />}>
      {searchParams.then((sp) => (
        <BrowsePageResults collection="alltimepopular" filters={parseFilters(sp)} />
      ))}
    </Suspense>
  );
}
