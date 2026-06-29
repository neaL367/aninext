import Image from "next/image";
import { StatusBadge } from "@/components/shared/status-badge";
import { StreamingService } from "@/components/shared/streaming-service";
import { Badge } from "@/components/ui/badge";
import type { MediaDetail } from "@/lib/anilist/types";
import {
  formatAlternateTitles,
  formatDisplayTitle,
  formatEpisodeCount,
} from "@/lib/anilist/utils/format";
import {
  formatDuration,
  formatMediaFormat,
  formatSeasonYear,
} from "@/lib/anilist/utils/labels";
import {
  getDetailHighlightStats,
  getDetailMetaRows,
} from "@/components/detail/detail-info";

type DetailHeroProps = {
  media: MediaDetail;
  streamingLinks: { site: string; url: string }[];
};

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border px-3 py-2.5 text-center">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium tabular-nums">{value}</dd>
    </div>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium leading-snug">{value}</dd>
    </div>
  );
}

export function DetailHero({ media, streamingLinks }: DetailHeroProps) {
  const title = formatDisplayTitle(media.title);
  const alternateTitles = formatAlternateTitles(media.title, title);
  const genres = media.genres?.filter(Boolean) ?? [];
  const tags =
    media.tags?.filter((t): t is NonNullable<typeof t> => Boolean(t)) ?? [];
  const highlightStats = getDetailHighlightStats(media);
  const metaRows = getDetailMetaRows(media);

  const metaLine = [
    formatMediaFormat(media.format),
    formatEpisodeCount(media.episodes),
    formatDuration(media.duration),
    formatSeasonYear(media.season ?? null, media.seasonYear ?? null),
  ]
    .filter((part) => part && part !== "—")
    .join(" · ");

  return (
    <section className="flex flex-col gap-6 sm:gap-8">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-8">
        <div
          className="relative aspect-[2/3] w-full max-w-[10.5rem] shrink-0 overflow-hidden rounded-lg border border-border sm:max-w-[11.5rem]"
          style={{ backgroundColor: media.coverImage?.color ?? "var(--muted)" }}
        >
          {media.coverImage?.large ? (
            <Image
              src={media.coverImage.large}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 168px, 184px"
              priority
            />
          ) : null}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-5 text-center sm:text-left">
          <header className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:justify-start">
              <StatusBadge status={media.status} />
              {genres.slice(0, 5).map((genre) => (
                <Badge key={genre} variant="outline" className="font-normal">
                  {genre}
                </Badge>
              ))}
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {title}
            </h1>
            {alternateTitles ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {alternateTitles}
              </p>
            ) : null}
            {metaLine ? (
              <p className="text-sm text-muted-foreground">{metaLine}</p>
            ) : null}
          </header>

          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {highlightStats.map((stat) => (
              <StatCell key={stat.label} label={stat.label} value={stat.value} />
            ))}
          </dl>

          {streamingLinks.length ? (
            <div className="flex flex-col items-center gap-2 sm:items-start">
              <p className="text-sm font-medium">Watch on</p>
              <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
                {streamingLinks.map((link) => (
                  <StreamingService
                    key={link.site}
                    site={link.site}
                    url={link.url}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-lg border border-border p-4 text-left sm:grid-cols-3 lg:grid-cols-5">
        {metaRows.map((row) => (
          <div
            key={row.label}
            className={row.wide ? "col-span-2 sm:col-span-3 lg:col-span-5" : undefined}
          >
            <MetaCell label={row.label} value={row.value} />
          </div>
        ))}
      </dl>

      {tags.length ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Tags</p>
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 16).map((tag) => (
              <Badge key={tag.id} variant="outline" className="font-normal">
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
