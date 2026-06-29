import { ProgressiveImage } from "@/components/shared/progressive-image";
import type { EpisodeCardData } from "@/lib/anilist/utils/episodes";
import { buildProgressiveImageSources, isAnilistCdnUrl } from "@/lib/anilist/utils/image-urls";
import { formatEpisodeAirDate } from "@/lib/anilist/utils/episodes";
import { Badge } from "@/components/ui/badge";
import { StreamingService } from "@/components/shared/streaming-service";
import { cn } from "@/lib/utils";

type EpisodeCardProps = {
  episode: EpisodeCardData;
  className?: string;
};

export function EpisodeCard({ episode, className }: EpisodeCardProps) {
  const isExternalLink = Boolean(episode.url);
  const thumbnail = episode.thumbnail;

  const content = (
    <article
      className={cn(
        "flex gap-3 rounded-lg border border-border bg-card p-3",
        className
      )}
    >
      <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-md border border-border bg-muted sm:w-32">
        {thumbnail ? (
          isAnilistCdnUrl(thumbnail) ? (
            <ProgressiveImage
              sources={buildProgressiveImageSources(thumbnail)}
              alt=""
              fill
              className="object-cover object-center"
              sizes="128px"
              loading="lazy"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnail}
              alt=""
              className="size-full object-cover object-center"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          )
        ) : (
          <div className="flex size-full items-center justify-center text-xs font-medium tabular-nums text-muted-foreground">
            {episode.episode}
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium tabular-nums text-muted-foreground">
            Ep {episode.episode}
          </span>
          {episode.isFiller ? (
            <Badge variant="outline" className="font-normal">
              Filler
            </Badge>
          ) : null}
          {episode.isRecap ? (
            <Badge variant="outline" className="font-normal">
              Recap
            </Badge>
          ) : null}
        </div>
        <h3 className="line-clamp-2 text-sm font-medium leading-snug">
          {episode.title}
        </h3>
        <dl className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <div>
            <dt className="sr-only">Air date</dt>
            <dd>{formatEpisodeAirDate(episode.airDate)}</dd>
          </div>
          {episode.runtime ? (
            <div>
              <dt className="sr-only">Runtime</dt>
              <dd className="tabular-nums">{episode.runtime}</dd>
            </div>
          ) : null}
        </dl>
        {episode.site ? (
          <StreamingService
            site={episode.site}
            url={episode.url}
            size="sm"
            linked={!isExternalLink}
          />
        ) : null}
      </div>
    </article>
  );

  if (isExternalLink) {
    return (
      <a
        href={episode.url!}
        target="_blank"
        rel="noopener noreferrer"
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {content}
      </a>
    );
  }

  return content;
}
