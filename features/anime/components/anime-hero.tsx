import { PlayIcon } from "lucide-react";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";

import { ImageWithLoading } from "@/components/ui/image-with-loading";
import { Skeleton } from "@/components/ui/skeleton";
import { getAnimeHero } from "@/features/anime/anime-queries";
import {
  formatFormat,
  formatStatus,
  getMediaCover,
  getMediaTitle,
} from "@/features/anime/lib/media-helpers";
import { scoreColor } from "@/features/anime/lib/score";
import { cn } from "@/lib/utils";

import type { Media } from "@/features/anime/types/anime";

export async function AnimeHeroSection({ id }: { id: number }) {
  const media = await getAnimeHero(id);
  if (!media) notFound();
  return <AnimeHero media={media} />;
}

export function AnimeHero({ media }: { media: Media }) {
  const title = getMediaTitle(media);
  const cover = getMediaCover(media);
  const banner = media.bannerImage;
  const color = media.coverImage.color;
  const studio = media.studios?.nodes[0]?.name;
  const description = media.description?.replace(/<[^>]*>/g, "").trim();

  return (
    <section className="relative">
      <div className="relative h-[360px] overflow-hidden border-b border-border-soft sm:h-[440px]">
        {banner ? (
          <ImageWithLoading
            src={banner}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: color
                ? `linear-gradient(120deg, ${color}70, var(--surface-2) 75%)`
                : "linear-gradient(120deg, var(--signal-strong), var(--surface-2) 75%)",
            }}
          />
        )}
        <div className="paper-grid absolute inset-0 opacity-20" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-transparent" />
      </div>

      <div className="relative mx-auto -mt-36 w-full max-w-[1680px] px-4 pb-8 sm:-mt-48 sm:px-7 sm:pb-12 lg:px-10">
        <div className="grid gap-7 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
          <div className="relative mx-auto w-44 shrink-0 self-end sm:mx-0 sm:w-52 lg:w-[220px]">
            <div
              className="relative aspect-[2/3] overflow-hidden border border-white/25 bg-surface-2 shadow-2xl"
              style={color ? { backgroundColor: color } : undefined}
            >
              {cover ? (
                <ViewTransition name={`anime-cover-${media.id}`} share="morph" default="none">
                  <ImageWithLoading
                    src={cover}
                    alt={`${title} cover`}
                    fill
                    priority
                    sizes="220px"
                    className="object-cover"
                  />
                </ViewTransition>
              ) : (
                <div
                  className="flex h-full items-center justify-center p-6 text-center"
                  style={{
                    background: color
                      ? `linear-gradient(135deg, ${color}55, var(--surface-2))`
                      : undefined,
                  }}
                >
                  <span className="font-mono text-xs uppercase tracking-[0.14em] text-paper/80">
                    {title}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="min-w-0 self-end">
            <p className="eyebrow text-accent">Anime details</p>
            <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl">
              {title}
            </h1>
            {media.title.native && (
              <p className="mt-3 text-sm text-muted-foreground">{media.title.native}</p>
            )}
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-muted-foreground">
              {media.averageScore && (
                <span className={cn("text-base font-semibold", scoreColor(media.averageScore))}>
                  {(media.averageScore / 10).toFixed(1)}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">score</span>
                </span>
              )}
              {media.format && <span>{formatFormat(media.format)}</span>}
              {media.episodes && <span>{media.episodes} episodes</span>}
              {media.duration && <span>{media.duration} min</span>}
              {media.status && (
                <span className={media.status === "RELEASING" ? "text-live-badge" : ""}>
                  {formatStatus(media.status)}
                </span>
              )}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {media.genres.slice(0, 5).map((genre) => (
                <span
                  key={genre}
                  className="border border-border-soft px-2 py-1 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted-foreground"
                >
                  {genre}
                </span>
              ))}
            </div>
            {description && (
              <p className="mt-6 line-clamp-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                {description}
              </p>
            )}
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              {studio && (
                <span>
                  <span className="font-medium text-foreground">{studio}</span>{" "}
                  <span className="font-mono uppercase tracking-[0.06em]">Studio</span>
                </span>
              )}
              {media.source && (
                <span>
                  <span className="font-medium text-foreground">
                    {media.source.replaceAll("_", " ")}
                  </span>{" "}
                  <span className="font-mono uppercase tracking-[0.06em]">Source</span>
                </span>
              )}
              {media.season && media.seasonYear && (
                <span>
                  <span className="font-medium text-foreground">
                    {media.season} {media.seasonYear}
                  </span>{" "}
                  <span className="font-mono uppercase tracking-[0.06em]">Season</span>
                </span>
              )}
              {media.studios?.nodes[1]?.name && (
                <span>
                  <span className="font-medium text-foreground">{media.studios.nodes[1].name}</span>{" "}
                  <span className="font-mono uppercase tracking-[0.06em]">Producer</span>
                </span>
              )}
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-5">
              {media.trailer?.id && media.trailer.site === "youtube" && (
                <a
                  href={`https://www.youtube.com/watch?v=${media.trailer.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border-b border-signal pb-2 text-sm font-medium text-signal hover:text-paper"
                >
                  <PlayIcon className="size-4 fill-current" /> Watch trailer
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AnimeHeroSkeleton() {
  return (
    <section>
      <div className="h-[360px] bg-surface-2 sm:h-[440px]" />
      <div className="mx-auto -mt-32 grid max-w-[1680px] gap-7 px-4 pb-12 sm:-mt-44 sm:grid-cols-[220px_minmax(0,1fr)] sm:px-7 lg:grid-cols-[220px_minmax(0,1fr)_240px] lg:px-10">
        <div className="shimmer aspect-[2/3] w-44 sm:w-52 lg:w-[220px]" />
        <div className="self-end space-y-5">
          <div className="shimmer h-2.5 w-24 rounded" />
          <div className="shimmer h-16 w-4/5 rounded" />
          <div className="shimmer h-4 w-2/3 rounded" />
          <div className="shimmer h-20 w-full rounded" />
        </div>
        <div className="hidden space-y-7 border-l border-border-soft pl-7 lg:block">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </section>
  );
}
