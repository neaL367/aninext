import { cache } from "react";
import {
  QueryClient,
  defaultShouldDehydrateQuery,
} from "@tanstack/react-query";
import { isAniListError } from "@/lib/anilist/domain/errors";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 3_600_000,
        retry: (failureCount, error) => {
          if (isAniListError(error)) {
            return false;
          }
          return failureCount < 1;
        },
      },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

const getServerQueryClient = cache(makeQueryClient);

export function getQueryClient() {
  if (typeof window === "undefined") {
    return getServerQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}
