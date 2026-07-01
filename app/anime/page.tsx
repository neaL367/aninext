import { connection } from "next/server";
import { Suspense } from "react";
import { AnimeBrowse } from "@/components/browse/anime-browse";
import { BrowseContentSkeleton } from "@/components/browse/browse-skeleton";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { AniListRateLimitNotice } from "@/components/shared/anilist-rate-limit-notice";
import { isAniListRateLimitError } from "@/lib/anilist/domain/errors";
import { LISTING_PAGE_SIZE } from "@/lib/anilist/domain/listing";
import { getCurrentAnimeSeason, getNextAnimeSeason } from "@/lib/anilist/domain/season";
import type { MediaPageQueryVariables } from "@/lib/anilist/generated/graphql";
import { getGenreCollection } from "@/lib/anilist/server/get-genre-collection";
import { getCachedMediaPage } from "@/lib/anilist/server/get-media-page";
import { parseAnimeListParams, paramsToMediaQuery } from "@/lib/browse/params";
import { createPageMetadata } from "@/lib/seo/metadata";

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

  try {
    const filter = paramsToMediaQuery(params, currentSeason, nextSeason);
    const variables = {
      ...filter,
      page: 1,
      perPage: LISTING_PAGE_SIZE,
    } as MediaPageQueryVariables;

    const [genres, initialResult] = await Promise.all([
      getGenreCollection(),
      getCachedMediaPage(variables),
    ]);

    return (
      <AnimeBrowse
        genres={genres}
        currentSeason={currentSeason}
        nextSeason={nextSeason}
        initialParams={params}
        initialResult={initialResult}
      />
    );
  } catch (error) {
    if (isAniListRateLimitError(error)) {
      return <AniListRateLimitNotice title="Unable to load anime list" />;
    }
    throw error;
  }
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
