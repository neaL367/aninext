import { Suspense } from "react";
import { AnimeBrowse, AnimeBrowseResults } from "@/components/browse/anime-browse";
import { BrowseContentSkeleton } from "@/components/browse/browse-skeleton";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { AniListRateLimitNotice } from "@/components/shared/anilist-rate-limit-notice";
import { isAniListRateLimitError } from "@/lib/anilist/domain/errors";
import { LISTING_PAGE_SIZE } from "@/lib/anilist/domain/listing";
import { getCurrentAnimeSeason, getNextAnimeSeason, formatSeasonLabel, type AnimeSeason } from "@/lib/anilist/domain/season";
import type { MediaPageQueryVariables } from "@/lib/anilist/generated/graphql";
import { anilist } from "@/lib/anilist/server/fetchers";
import { getGenreCollection } from "@/lib/anilist/server/get-genre-collection";
import { parseAnimeListParams, paramsToMediaQuery } from "@/lib/browse/params";
import { createPageMetadata } from "@/lib/seo/metadata";
import type { AnimeSort } from "@/lib/browse/params/types";
import { BrowseFiltersProvider } from "@/components/browse/browse-filters-provider";
import { AnimeBrowseToolbar } from "@/components/browse/anime-browse-toolbar";

const SORT_HEADERS: Record<AnimeSort, { title: string; description: (current: string, next: string) => string }> = {
  trending: {
    title: "Trending Anime",
    description: () => "Currently popular and trending series across the community.",
  },
  "popular-this-season": {
    title: "Season Anime",
    description: (current) => `Anime airing during the ${current} season.`,
  },
  "upcoming-next-season": {
    title: "Upcoming Anime",
    description: (current, next) => `Highly anticipated series for the ${next} season.`,
  },
  "all-time-popular": {
    title: "Popular Anime",
    description: () => "The most loved and highest-rated anime of all time.",
  },
  "top-100": {
    title: "Top 100 Anime",
    description: () => "The definitive list of the 100 best anime based on global ratings.",
  },
};

export const metadata = createPageMetadata({
  title: "Browse Anime",
  description: "Filter and discover anime with instant search and advanced filters.",
  path: "/anime",
});

export const instant = false;

type AnimeListingPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function AnimeListingContent({ 
  searchParams, 
  genres, 
  currentSeason, 
  nextSeason 
}: { 
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  genres: any[];
  currentSeason: AnimeSeason;
  nextSeason: AnimeSeason;
}) {
  const resolved = await searchParams;
  const params = parseAnimeListParams(resolved);

  try {
    const filter = paramsToMediaQuery(params, currentSeason, nextSeason);
    const variables = {
      ...filter,
      page: 1,
      perPage: LISTING_PAGE_SIZE,
    } as MediaPageQueryVariables;

    const initialResult = await anilist.mediaPage(variables);

    return (
      <AnimeBrowseResults 
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

export default async function AnimePage({ searchParams }: AnimeListingPageProps) {
  const resolved = await searchParams;
  const params = parseAnimeListParams(resolved);
  
  const currentSeason = getCurrentAnimeSeason();
  const nextSeason = getNextAnimeSeason();
  const currentSeasonStr = formatSeasonLabel(currentSeason);
  const nextSeasonStr = formatSeasonLabel(nextSeason);
  
  const header = SORT_HEADERS[params.sort] || SORT_HEADERS.trending;
  const genres = await getGenreCollection();

  return (
    <PageContainer className="py-8 lg:py-10">
      <div className="flex flex-col gap-6">
        <PageHeader
          title={header.title}
          description={header.description(currentSeasonStr, nextSeasonStr)}
        />
        <BrowseFiltersProvider genres={genres} currentSeason={currentSeason} nextSeason={nextSeason}>
          <AnimeBrowseToolbar />
          <Suspense 
            key={`${params.sort}-${params.q}-${params.genres.join(",")}`} 
            fallback={<BrowseContentSkeleton />}
          >
            <AnimeListingContent 
              searchParams={searchParams} 
              genres={genres} 
              currentSeason={currentSeason} 
              nextSeason={nextSeason} 
            />
          </Suspense>
        </BrowseFiltersProvider>
      </div>
    </PageContainer>
  );
}
