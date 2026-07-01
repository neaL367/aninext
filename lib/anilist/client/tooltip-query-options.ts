import { fetchMediaCardTooltipFromApi } from "@/lib/anilist/client/media-api";
import { anilistQueryGcTime, anilistQueryStaleTime } from "@/lib/anilist/client/query-policy";

export function mediaCardTooltipOptions(mediaId: number) {
  return {
    queryKey: ["anilist", "tooltip", mediaId] as const,
    queryFn: () => fetchMediaCardTooltipFromApi(mediaId),
    staleTime: anilistQueryStaleTime.tooltip,
    gcTime: anilistQueryGcTime.tooltip,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  };
}
