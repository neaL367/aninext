import { Suspense } from "react";

import { BrowsePageShell } from "@/features/anime/components/browse/browse-page-shell";
import { MediaGridSkeleton } from "@/features/anime/components/browse/media-grid";
import { SeasonalResults } from "@/features/anime/components/browse/seasonal-results";
import { getCollectionMetadata } from "@/features/anime/lib/collection-config";
import { parseFilters } from "@/features/anime/lib/parse-filters";

import type { Metadata } from "next";

export function generateMetadata(): Metadata {
  return getCollectionMetadata("seasonal");
}

export default function SeasonalPage({ searchParams }: PageProps<"/anime/seasonal">) {
  return (
    <BrowsePageShell collection="seasonal">
      <Suspense fallback={<MediaGridSkeleton count={20} />}>
        {searchParams.then((sp) => (
          <SeasonalResults
            season={typeof sp.season === "string" ? sp.season : undefined}
            year={typeof sp.year === "string" ? sp.year : undefined}
            filters={parseFilters(sp)}
          />
        ))}
      </Suspense>
    </BrowsePageShell>
  );
}
