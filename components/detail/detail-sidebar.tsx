import { StarIcon } from "lucide-react";
import { DetailAsideCover } from "@/components/detail/detail-aside-cover";
import { DetailFactRow } from "@/components/detail/detail-fact-row";
import { DetailFactsPanel } from "@/components/detail/detail-facts-panel";
import type { MediaDetail } from "@/lib/anilist/domain/types";
import { coverProgressiveSources } from "@/lib/anilist/display/image-urls";
import {
  formatChapterCount,
  formatDisplayTitle,
  formatEpisodeCount,
  formatFuzzyDate,
  formatScore,
  formatVolumeCount,
} from "@/lib/anilist/display/format";
import {
  formatCountry,
  formatDuration,
  formatMediaFormat,
  formatMediaSource,
  formatSeasonYear,
} from "@/lib/anilist/display/labels";
import { getDetailStudios } from "@/lib/anilist/display/detail-studios";

type DetailSidebarProps = {
  media: MediaDetail;
};

export function DetailSidebar({ media }: DetailSidebarProps) {
  const title = formatDisplayTitle(media.title);
  const score = formatScore(media.averageScore);
  const coverSources = coverProgressiveSources(media.coverImage);
  const isManga = media.type === "MANGA";

  return (
    <aside className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
      <DetailAsideCover
        alt={title}
        sources={coverSources}
        backgroundColor={media.coverImage?.color}
      />

      {score !== "—" ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3">
          <StarIcon className="size-5 fill-amber-400 text-amber-400" />
          <span className="text-2xl font-semibold tabular-nums">{score}</span>
          <span className="text-sm text-muted-foreground">user score</span>
        </div>
      ) : null}

      <DetailFactsPanel>
        <DetailFactRow label="Format" value={formatMediaFormat(media.format)} />
        {isManga ? (
          <>
            <DetailFactRow
              label="Chapters"
              value={formatChapterCount(media.chapters)}
            />
            <DetailFactRow
              label="Volumes"
              value={formatVolumeCount(media.volumes)}
            />
          </>
        ) : (
          <>
            <DetailFactRow
              label="Episodes"
              value={formatEpisodeCount(media.episodes)}
            />
            <DetailFactRow
              label="Duration"
              value={formatDuration(media.duration)}
            />
            <DetailFactRow
              label="Season"
              value={formatSeasonYear(
                media.season ?? null,
                media.seasonYear ?? null
              )}
            />
          </>
        )}
        <DetailFactRow label="Started" value={formatFuzzyDate(media.startDate)} />
        <DetailFactRow label="Ended" value={formatFuzzyDate(media.endDate)} />
        <DetailFactRow label="Source" value={formatMediaSource(media.source)} />
        <DetailFactRow
          label="Country"
          value={formatCountry(
            typeof media.countryOfOrigin === "string"
              ? media.countryOfOrigin
              : null
          )}
        />
        <DetailFactRow label="Studios" value={getDetailStudios(media)} />
      </DetailFactsPanel>
    </aside>
  );
}
