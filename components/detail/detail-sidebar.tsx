import Image from "next/image";
import { StarIcon } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import type { MediaDetail } from "@/lib/anilist/types";
import {
  formatDisplayTitle,
  formatEpisodeCount,
  formatFuzzyDate,
  formatScore,
} from "@/lib/anilist/utils/format";
import {
  formatCountry,
  formatDuration,
  formatMediaFormat,
  formatMediaSource,
  formatSeasonYear,
} from "@/lib/anilist/utils/labels";
import { getDetailStudios } from "@/components/detail/detail-info";

type DetailSidebarProps = {
  media: MediaDetail;
};

function SidebarFact({ label, value }: { label: string; value: string }) {
  if (!value || value === "—") return null;
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium leading-snug">{value}</dd>
    </div>
  );
}

export function DetailSidebar({ media }: DetailSidebarProps) {
  const title = formatDisplayTitle(media.title);
  const score = formatScore(media.averageScore);
  const genres = media.genres?.filter(Boolean) ?? [];

  return (
    <aside className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
      <div
        className="relative mx-auto aspect-[2/3] w-full max-w-[13rem] overflow-hidden rounded-xl border border-border shadow-lg ring-1 ring-border/60 sm:max-w-[15rem] lg:mx-0 lg:max-w-none"
        style={{ backgroundColor: media.coverImage?.color ?? "var(--muted)" }}
      >
        {media.coverImage?.large ? (
          <Image
            src={media.coverImage.large}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 240px, 260px"
            priority
          />
        ) : null}
      </div>

      {score !== "—" ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3">
          <StarIcon className="size-5 fill-amber-400 text-amber-400" />
          <span className="text-2xl font-semibold tabular-nums">{score}</span>
          <span className="text-sm text-muted-foreground">user score</span>
        </div>
      ) : null}

      <div className="flex flex-wrap justify-center gap-1.5 lg:justify-start">
        <StatusBadge status={media.status} />
        {genres.map((genre) => (
          <Badge key={genre} variant="outline" className="font-normal">
            {genre}
          </Badge>
        ))}
      </div>

      <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-card/50 p-4">
        <p className="text-sm font-medium">Information</p>
        <dl className="flex flex-col gap-2.5">
          <SidebarFact label="Format" value={formatMediaFormat(media.format)} />
          <SidebarFact label="Episodes" value={formatEpisodeCount(media.episodes)} />
          <SidebarFact label="Duration" value={formatDuration(media.duration)} />
          <SidebarFact
            label="Season"
            value={formatSeasonYear(media.season ?? null, media.seasonYear ?? null)}
          />
          <SidebarFact label="Started" value={formatFuzzyDate(media.startDate)} />
          <SidebarFact label="Ended" value={formatFuzzyDate(media.endDate)} />
          <SidebarFact label="Source" value={formatMediaSource(media.source)} />
          <SidebarFact
            label="Country"
            value={formatCountry(
              typeof media.countryOfOrigin === "string"
                ? media.countryOfOrigin
                : null
            )}
          />
          <SidebarFact label="Studios" value={getDetailStudios(media)} />
        </dl>
      </div>
    </aside>
  );
}
