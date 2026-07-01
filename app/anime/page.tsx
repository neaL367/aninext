import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { connection } from "next/server";
import { Suspense } from "react";
import { AnimeBrowse } from "@/components/browse/anime-browse";
import { BrowseContentSkeleton } from "@/components/browse/browse-skeleton";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { getGenreCollection } from "@/lib/anilist/server/get-genre-collection";
import { mediaPageInfiniteOptions } from "@/lib/anilist/client/query-options.server";
import { getCurrentAnimeSeason, getNextAnimeSeason } from "@/lib/anilist/domain/season";
import { parseAnimeListParams } from "@/lib/browse/params";
import { createPageMetadata } from "@/lib/seo/metadata";
import { getQueryClient } from "@/lib/react-query/get-query-client";

export const instant = false;

export const metadata = createPageMetadata({
  title: "Browse Anime",
  description: "Filter and discover anime with instant search and advanced filters.",
  path: "/anime",
});

type AnimeListingPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function AnimeListingContent({ searchParams }: AnimeListingPageProps) {
  await connection();
  const resolved = await searchParams;
  const params = parseAnimeListParams(resolved);
  const currentSeason = getCurrentAnimeSeason();
  const nextSeason = getNextAnimeSeason();
  const queryClient = getQueryClient();

  const [genres] = await Promise.all([
    getGenreCollection(),
    queryClient.prefetchInfiniteQuery(mediaPageInfiniteOptions(params, currentSeason, nextSeason)),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AnimeBrowse genres={genres} currentSeason={currentSeason} nextSeason={nextSeason} />
    </HydrationBoundary>
  );
}

export default function AnimePage({ searchParams }: AnimeListingPageProps) {
  return (
    <PageContainer className="py-8 lg:py-10">
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Anime"
          description="Search and filter — use the navigation above to switch lists."
        />
        <Suspense fallback={<BrowseContentSkeleton />}>
          <AnimeListingContent searchParams={searchParams} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
