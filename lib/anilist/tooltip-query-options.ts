import { fetchMediaCardTooltipAction } from "@/lib/anilist/actions/fetch-media-card-tooltip";

const TOOLTIP_STALE_TIME_MS = 5 * 60 * 1000;

export function mediaCardTooltipOptions(mediaId: number) {
  return {
    queryKey: ["anilist", "tooltip", mediaId] as const,
    queryFn: () => fetchMediaCardTooltipAction(mediaId),
    staleTime: TOOLTIP_STALE_TIME_MS,
  };
}
