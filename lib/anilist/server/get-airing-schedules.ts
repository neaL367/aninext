import { cache } from "react";
import { airingSchedulesOptions } from "@/lib/anilist/query-options";
import { getQueryClient } from "@/lib/react-query/get-query-client";

export const getAiringSchedules = cache(async (start: number, end: number) => {
  const queryClient = getQueryClient();
  return queryClient.fetchQuery(airingSchedulesOptions(start, end));
});
