import {
  infiniteQueryOptions,
  queryOptions,
} from "@tanstack/react-query";
import {
  CAROUSEL_PER_PAGE,
  LISTING_PAGE_SIZE,
  TOP_100_LIMIT,
} from "./constants";
import { fetchAllAiringSchedules } from "@/lib/anilist/fetch-airing-schedules";
import {
  GenreCollectionDocument,
  MediaDetailDocument,
  MediaPageDocument,
  MediaPageQueryVariables,
} from "./generated/graphql";
import { executeGraphQL } from "./graphql-client";
import {
  getHomeSectionsQueryKey,
  getHomeSectionQueryKey,
  HOME_SECTION_IDS,
} from "./home-sections";
import { getHomeSections } from "@/lib/anilist/server/get-home-sections";
import { queryKeys } from "./query-keys";
import {
  normalizeMediaDetail,
  normalizeMediaPageResult,
  type MediaCard,
  type MediaPageResult,
} from "./types";
import { applyPopularityPercents } from "./utils/format";
import { withTop100Ranks } from "./utils/rank";
import {
  getCurrentAnimeSeason,
  getNextAnimeSeason,
} from "./utils/season";
import type { AnimeListParams } from "@/lib/routes/search-params";
import {
  getListingMaxPage,
  paramsToMediaFilter,
} from "@/lib/routes/search-params";

type MediaListVariables = MediaPageQueryVariables;

function mediaCarouselOptions(
  variables: Omit<MediaListVariables, "page" | "perPage">,
  queryKey: readonly unknown[]
) {
  return queryOptions<MediaCard[], Error, MediaCard[], readonly unknown[]>({
    queryKey,
    queryFn: async () => {
      const data = await executeGraphQL(MediaPageDocument, {
        ...variables,
        page: 1,
        perPage: CAROUSEL_PER_PAGE,
      });
      const result = normalizeMediaPageResult(data);
      return applyPopularityPercents(result.media);
    },
    staleTime: 300_000,
    refetchOnMount: false,
  });
}

export function mediaDetailOptions(id: number) {
  return queryOptions({
    queryKey: queryKeys.media.detail(id),
    queryFn: async () => {
      const data = await executeGraphQL(MediaDetailDocument, { id });
      return normalizeMediaDetail(data);
    },
    staleTime: 600_000,
    refetchOnMount: false,
  });
}

export function airingSchedulesOptions(start: number, end: number) {
  return queryOptions({
    queryKey: queryKeys.airing.range(start, end),
    queryFn: () => fetchAllAiringSchedules(start, end),
    staleTime: 900_000,
    refetchOnMount: false,
  });
}

export function genreCollectionOptions() {
  return queryOptions({
    queryKey: queryKeys.genres,
    queryFn: fetchGenreCollection,
    staleTime: 86_400_000,
  });
}

async function fetchGenreCollection() {
  const data = await executeGraphQL(GenreCollectionDocument, {});
  return (data.GenreCollection ?? [])
    .filter((name): name is string => Boolean(name))
    .map((name, index) => ({ id: index, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function homeSectionsOptions() {
  return queryOptions({
    queryKey: getHomeSectionsQueryKey(),
    queryFn: getHomeSections,
  });
}

export function seedHomeSectionQueries(
  queryClient: import("@tanstack/react-query").QueryClient,
  sections: Awaited<ReturnType<typeof getHomeSections>>
) {
  for (const section of HOME_SECTION_IDS) {
    queryClient.setQueryData(getHomeSectionQueryKey(section), sections[section]);
  }
}

export function trendingMediaOptions() {
  return mediaCarouselOptions(
    { sort: ["TRENDING_DESC"] },
    queryKeys.home.trending
  );
}

export function airingNowMediaOptions() {
  return mediaCarouselOptions(
    { sort: ["POPULARITY_DESC"], status: "RELEASING" },
    queryKeys.home.airingNow
  );
}

export function popularThisSeasonMediaOptions() {
  const { season, year } = getCurrentAnimeSeason();
  return mediaCarouselOptions(
    {
      sort: ["POPULARITY_DESC"],
      season,
      seasonYear: year,
    },
    queryKeys.home.popularThisSeason(season, year)
  );
}

export function upcomingNextSeasonMediaOptions() {
  const { season, year } = getNextAnimeSeason();
  return mediaCarouselOptions(
    {
      sort: ["POPULARITY_DESC"],
      season,
      seasonYear: year,
      status_in: ["NOT_YET_RELEASED"],
    },
    queryKeys.home.upcomingNextSeason(season, year)
  );
}

export function allTimePopularMediaOptions() {
  return mediaCarouselOptions(
    { sort: ["POPULARITY_DESC"] },
    queryKeys.home.allTimePopular
  );
}

export function top100MediaOptions() {
  return queryOptions<MediaCard[], Error, MediaCard[], readonly unknown[]>({
    queryKey: queryKeys.home.top100,
    queryFn: async () => {
      const data = await executeGraphQL(MediaPageDocument, {
        sort: ["SCORE_DESC"],
        page: 1,
        perPage: CAROUSEL_PER_PAGE,
      });
      const result = normalizeMediaPageResult(data);
      const media = applyPopularityPercents(result.media);
      return withTop100Ranks(media).slice(0, CAROUSEL_PER_PAGE);
    },
  });
}

export function mediaPageInfiniteOptions(
  params: AnimeListParams,
  currentSeason = getCurrentAnimeSeason(),
  nextSeason = getNextAnimeSeason()
) {
  const filter = paramsToMediaFilter(params, currentSeason, nextSeason);
  const maxPage = getListingMaxPage(params.sort);

  return infiniteQueryOptions({
    queryKey: queryKeys.media.infiniteList(filter),
    queryFn: async ({ pageParam }) => {
      const data = await executeGraphQL(MediaPageDocument, {
        ...filter,
        page: pageParam,
        perPage: LISTING_PAGE_SIZE,
      } as MediaPageQueryVariables);
      return normalizeMediaPageResult(data);
    },
    initialPageParam: 1,
    staleTime: 300_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      const loadedCount = allPages.flatMap((page) => page.media).length;

      if (params.sort === "top-100") {
        if (loadedCount >= TOP_100_LIMIT) {
          return undefined;
        }
        if (maxPage !== null && lastPageParam >= maxPage) {
          return undefined;
        }
      }

      if (!lastPage.pageInfo.hasNextPage) {
        return undefined;
      }

      return lastPageParam + 1;
    },
    select: (data): { pages: MediaPageResult[]; media: MediaCard[] } => {
      let media = data.pages.flatMap((page) => page.media);
      media = applyPopularityPercents(media);

      if (params.sort === "top-100") {
        media = withTop100Ranks(media).slice(0, TOP_100_LIMIT);
      }

      return { pages: data.pages, media };
    },
  });
}
