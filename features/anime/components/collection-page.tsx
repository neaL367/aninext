import { Suspense } from "react";

import { BrowsePageResults } from "@/features/anime/components/browse-page-shell";
import { MediaGridSkeleton } from "@/features/anime/components/media-grid";
import { parseFilters } from "@/features/anime/lib/parse-filters";

import type { AnimeCollection } from "@/features/anime/types/anime";

export function CollectionPage({
  collection,
  searchParams,
}: {
  collection: AnimeCollection;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <Suspense fallback={<MediaGridSkeleton count={20} />}>
      {searchParams.then((sp) => (
        <BrowsePageResults collection={collection} filters={parseFilters(sp)} />
      ))}
    </Suspense>
  );
}
