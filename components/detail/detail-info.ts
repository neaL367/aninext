import type { MediaDetail } from "@/lib/anilist/types";
import {
  formatEpisodeCount,
  formatFuzzyDate,
  formatScore,
} from "@/lib/anilist/utils/format";
import {
  formatCountry,
  formatDuration,
  formatMediaSource,
  formatSeasonYear,
} from "@/lib/anilist/utils/labels";

export type DetailInfoRow = {
  label: string;
  value: string;
  wide?: boolean;
};

export function getDetailStudios(media: MediaDetail): string {
  return (
    media.studios?.nodes
      ?.filter((s): s is NonNullable<typeof s> => Boolean(s))
      .map((s) => s.name)
      .join(", ") || "—"
  );
}

export function getDetailHighlightStats(media: MediaDetail): DetailInfoRow[] {
  return [
    { label: "Score", value: formatScore(media.averageScore) },
    { label: "Episodes", value: formatEpisodeCount(media.episodes) },
    { label: "Duration", value: formatDuration(media.duration) },
    {
      label: "Season",
      value: formatSeasonYear(media.season ?? null, media.seasonYear ?? null),
    },
  ];
}

export function getDetailMetaRows(media: MediaDetail): DetailInfoRow[] {
  return [
    { label: "Started", value: formatFuzzyDate(media.startDate) },
    { label: "Ended", value: formatFuzzyDate(media.endDate) },
    { label: "Source", value: formatMediaSource(media.source) },
    {
      label: "Country",
      value: formatCountry(
        typeof media.countryOfOrigin === "string"
          ? media.countryOfOrigin
          : null
      ),
    },
    { label: "Studios", value: getDetailStudios(media), wide: true },
  ];
}
