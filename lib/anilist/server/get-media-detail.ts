import { cache } from "react";
import { mediaDetailOptions } from "@/lib/anilist/query-options";
import { getQueryClient } from "@/lib/react-query/get-query-client";

/** Dedupes media detail fetches within a single request (page + generateMetadata). */
export const getMediaDetail = cache(async (mediaId: number) => {
  const queryClient = getQueryClient();
  return queryClient.fetchQuery(mediaDetailOptions(mediaId));
});
