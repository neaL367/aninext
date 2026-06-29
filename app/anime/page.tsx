import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { connection } from "next/server";
import { Suspense } from "react";
import { AnimeBrowse } from "@/components/browse/anime-browse";
import { BrowseSkeleton } from "@/components/browse/browse-skeleton";
import { PageContainer } from "@/components/layout/page-container";
import { getGenreCollection } from "@/lib/anilist/server/get-genre-collection";
import { mediaPageInfiniteOptions } from "@/lib/anilist/query-options.server";
import {
  getCurrentAnimeSeason,
  getNextAnimeSeason,
} from "@/lib/anilist/utils/season";
import { buildAnimeBrowseHref } from "@/lib/routes/browse-url";
import { parseAnimeListParams } from "@/lib/routes/search-params";
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

  const genres = await getGenreCollection();
  void queryClient.prefetchInfiniteQuery(
    mediaPageInfiniteOptions(params, currentSeason, nextSeason)
  );

  return (
    <PageContainer className="py-8 lg:py-10">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <AnimeBrowse
          key={buildAnimeBrowseHref(params)}
          initialParams={params}
          genres={genres}
        />
      </HydrationBoundary>
    </PageContainer>
  );
}

export default function AnimePage({ searchParams }: AnimeListingPageProps) {
  return (
    <Suspense
      fallback={
        <PageContainer className="py-8 lg:py-10">
          <BrowseSkeleton />
        </PageContainer>
      }
    >
      <AnimeListingContent searchParams={searchParams} />
    </Suspense>
  );
}
