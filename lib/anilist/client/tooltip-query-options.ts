import { fetchMediaCardTooltipAction } from "@/lib/anilist/client/actions/fetch-media-card-tooltip";
import {
  anilistQueryGcTime,
  anilistQueryStaleTime,
} from "@/lib/anilist/client/query-policy";

export function mediaCardTooltipOptions(mediaId: number) {
  return {
    queryKey: ["anilist", "tooltip", mediaId] as const,
    queryFn: () => fetchMediaCardTooltipAction(mediaId),
    staleTime: anilistQueryStaleTime.tooltip,
    gcTime: anilistQueryGcTime.tooltip,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  };
}
