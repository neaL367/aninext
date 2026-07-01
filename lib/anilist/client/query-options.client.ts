import { infiniteQueryOptions } from "@tanstack/react-query";
import { fetchMediaPageFromApi } from "@/lib/anilist/client/media-api";
import { buildMediaPageInfiniteConfig } from "./media-page-infinite-shared";
import type { MediaPageQueryVariables } from "@/lib/anilist/generated/graphql";
import type { AnimeListParams } from "@/lib/browse/params";
import type { AnimeSeason } from "@/lib/anilist/domain/season";

export function mediaPageInfiniteOptions(
  params: AnimeListParams,
  currentSeason: AnimeSeason,
  nextSeason: AnimeSeason,
) {
  const config = buildMediaPageInfiniteConfig(params, currentSeason, nextSeason);

  return infiniteQueryOptions({
    queryKey: config.queryKey,
    queryFn: async ({ pageParam }) => {
      return fetchMediaPageFromApi({
        ...config.filter,
        page: pageParam,
        perPage: config.perPage,
      } as MediaPageQueryVariables);
    },
    initialPageParam: config.initialPageParam,
    staleTime: config.staleTime,
    gcTime: config.gcTime,
    refetchOnMount: config.refetchOnMount,
    refetchOnWindowFocus: config.refetchOnWindowFocus,
    getNextPageParam: config.getNextPageParam,
    select: config.select,
  });
}
