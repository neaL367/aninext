import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Media } from "@/features/anime/types/anime";
import { scoreColor, scoreBg } from "@/features/anime/lib/score";
import { getMediaTitle, getMediaCover, fromAiringTimestamp } from "@/features/anime/lib/media-helpers";
import { cn } from "@/lib/utils";

function AiringCountdown({ airingAt, episode }: { airingAt: number; episode: number }) {
  const date = fromAiringTimestamp(airingAt);
  const now = Date.now();
  const diff = airingAt * 1000 - now;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border-soft bg-surface-2/50 p-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-live-badge/15">
        <span className="size-2 animate-pulse rounded-full bg-live-badge" />
      </div>
      <div>
        <p className="text-sm font-medium">Next Episode</p>
        <p className="font-mono text-xs text-muted-foreground tabular-nums">
          Episode {episode} — {days > 0 ? `${days}d ` : ""}{hours}h
        </p>
      </div>
    </div>
  );
}

export function AnimeHero({ media }: { media: Media }) {
  const title = getMediaTitle(media);
  const cover = getMediaCover(media);
  const banner = media.bannerImage;
  const studio = media.studios?.nodes[0]?.name;

  return (
    <div className="flex flex-col">
      {/* Banner */}
      {banner && (
        <div className="relative h-72 w-full overflow-hidden sm:h-80 lg:h-96">
          <Image
            src={banner}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/20 to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className="relative -mt-24 px-4 sm:-mt-32 sm:px-6 lg:-mt-40 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 sm:flex-row">
          {/* Cover */}
          {cover && (
            <div className="shrink-0">
              <div className="relative w-40 overflow-hidden rounded-xl border border-border/40 shadow-2xl sm:w-48 lg:w-56">
                <div className="aspect-[2/3]">
                  <Image
                    src={cover}
                    alt={`${title} cover`}
                    fill
                    priority
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="flex flex-1 flex-col gap-5 pt-4 sm:pt-0">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                {title}
              </h1>
              {media.title.native && (
                <p className="mt-2 text-lg text-muted-foreground">{media.title.native}</p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {media.averageScore && (
                <div className={cn("flex items-center gap-1.5 rounded-lg bg-black/20 px-2.5 py-1 backdrop-blur-sm", scoreBg(media.averageScore))}>
                  <span className={cn("font-mono text-sm font-bold tabular-nums text-white", scoreColor(media.averageScore))}>
                    {(media.averageScore / 10).toFixed(1)}
                  </span>
                </div>
              )}
              {media.format && (
                <Badge
                  variant="secondary"
                  className="rounded-md border-none bg-secondary/80 font-mono text-[11px] font-medium uppercase tracking-wide backdrop-blur-sm"
                >
                  {media.format}
                </Badge>
              )}
              {media.status && (
                <Badge
                  variant="outline"
                  className="rounded-md border-border/60 bg-transparent backdrop-blur-sm"
                >
                  {media.status === "RELEASING" ? (
                    <span className="flex items-center gap-1.5">
                      <span className="size-1.5 animate-pulse rounded-full bg-live-badge" />
                      Airing
                    </span>
                  ) : (
                    media.status
                  )}
                </Badge>
              )}
              {media.episodes && (
                <span className="font-mono text-sm text-muted-foreground tabular-nums">
                  {media.episodes} episodes
                </span>
              )}
              {media.duration && (
                <span className="font-mono text-sm text-muted-foreground tabular-nums">
                  {media.duration} min/ep
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {media.genres.map((g) => (
                <span
                  key={g}
                  className="rounded-full border border-border/60 bg-transparent px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  {g}
                </span>
              ))}
            </div>

            {media.description && (
              <div
                className="max-w-2xl text-sm leading-relaxed text-muted-foreground [&_br]:block [&_i]:italic [&_b]:font-medium [&_b]:text-foreground"
                dangerouslySetInnerHTML={{ __html: media.description }}
              />
            )}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {studio && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Studio</p>
                  <p className="mt-0.5 text-sm font-medium">{studio}</p>
                </div>
              )}
              {media.source && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Source</p>
                  <p className="mt-0.5 text-sm font-medium">{media.source}</p>
                </div>
              )}
              {media.season && media.seasonYear && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Season</p>
                  <p className="mt-0.5 text-sm font-medium">{media.season} {media.seasonYear}</p>
                </div>
              )}
            </div>

            {media.nextAiringEpisode && (
              <AiringCountdown
                airingAt={media.nextAiringEpisode.airingAt}
                episode={media.nextAiringEpisode.episode}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AnimeHeroSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="shimmer h-72 w-full sm:h-80 lg:h-96" />
      <div className="relative -mt-24 px-4 sm:-mt-32 sm:px-6 lg:-mt-40 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 sm:flex-row">
          <Skeleton className="h-60 w-40 shrink-0 rounded-xl sm:w-48 lg:h-72 lg:w-56" />
          <div className="flex flex-1 flex-col gap-5 pt-4 sm:pt-0">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-7 w-16 rounded-full" />
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-20 rounded-full" />
              ))}
            </div>
            <Skeleton className="h-32 w-full max-w-2xl" />
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-5 w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
