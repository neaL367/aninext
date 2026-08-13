import { ExternalLinkIcon, PlayIcon } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";

import { MediaImage } from "@/components/ui/media-image";
import { getAnimeDetail } from "@/features/anime/anime-queries";
import {
  formatFormat,
  formatStatus,
  getFaviconUrl,
  getMediaCover,
  getMediaTitle,
  getStreamingLinks,
  stripHtml,
} from "@/features/anime/lib/media-helpers";
import { cn } from "@/lib/utils";

import type { Media } from "@/features/anime/types/anime";

export async function AnimeHeroSection({ id }: { id: number | null }) {
  if (id === null) notFound();

  const media = await getAnimeDetail(id);
  if (!media) notFound();
  return <AnimeHero media={media} />;
}

export function AnimeHero({ media }: { media: Media }) {
  const title = getMediaTitle(media);
  const cover = getMediaCover(media);
  const banner = media.bannerImage;
  const color = media.coverImage.color;
  const studio = media.studios?.nodes[0]?.name;
  const description = stripHtml(media.description);

  return (
    <section className="relative">
      <div className="relative h-[380px] overflow-hidden border-b border-border-soft sm:h-[460px]">
        {banner ? (
          <MediaImage
            src={banner}
            alt=""
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover transform-gpu"
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
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-transparent" />
      </div>

      <div className="relative mx-auto -mt-36 w-full max-w-[1680px] px-4 pb-8 sm:-mt-48 sm:px-7 sm:pb-12 lg:px-10">
        <div className="grid gap-7 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
          <div className="relative mx-auto w-44 shrink-0 self-end sm:mx-0 sm:w-52 lg:w-[220px]">
            <div
              className="relative aspect-[2/3] overflow-hidden rounded-md border border-border-soft bg-surface-2 shadow-2xl isolate transform-gpu"
              style={color ? { backgroundColor: color } : undefined}
            >
              {cover ? (
                <ViewTransition name={`anime-cover-${media.id}`} share="morph" default="none">
                  <MediaImage
                    src={cover}
                    alt={`${title} cover`}
                    fill
                    priority
                    sizes="220px"
                    className="object-cover transform-gpu"
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

          <div className="min-w-0 self-end space-y-4">
            <p className="eyebrow text-signal">Anime details</p>
            <h1 className="text-4xl font-semibold leading-[0.98] tracking-[-0.055em] text-foreground sm:text-6xl">
              {title}
            </h1>
            {media.title.native && (
              <p className="text-sm font-mono text-muted-foreground">{media.title.native}</p>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-muted-foreground pt-1">
              {media.averageScore && (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-surface-1/90 border border-border-soft px-2.5 py-1 text-xs font-bold text-signal backdrop-blur-md">
                  {(media.averageScore / 10).toFixed(1)}
                  <span className="text-[0.65rem] font-normal text-muted-foreground">score</span>
                </span>
              )}
              {media.format && (
                <span className="rounded-md border border-border-soft bg-surface-1/60 px-2 py-1">
                  {formatFormat(media.format)}
                </span>
              )}
              {media.episodes && (
                <span className="rounded-md border border-border-soft bg-surface-1/60 px-2 py-1">
                  {media.episodes} episodes
                </span>
              )}
              {media.duration && (
                <span className="rounded-md border border-border-soft bg-surface-1/60 px-2 py-1">
                  {media.duration} min
                </span>
              )}
              {media.status && (
                <span
                  className={cn(
                    "rounded-md border px-2 py-1 font-semibold",
                    media.status === "RELEASING"
                      ? "border-destructive/30 bg-destructive/15 text-destructive"
                      : "border-border-soft bg-surface-1/60 text-muted-foreground",
                  )}
                >
                  {formatStatus(media.status)}
                </span>
              )}
            </div>

            {media.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {media.genres.slice(0, 5).map((genre) => (
                  <span
                    key={genre}
                    className="rounded-md border border-border-soft bg-surface-1/80 px-2.5 py-0.5 font-mono text-[0.62rem] uppercase tracking-wider text-muted-foreground"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {description && (
              <p className="line-clamp-3 max-w-3xl text-xs sm:text-sm leading-relaxed text-muted-foreground font-normal pt-1">
                {description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground pt-2 font-mono">
              {studio && (
                <span>
                  <span className="font-semibold text-foreground">{studio}</span>{" "}
                  <span className="text-[0.65rem] uppercase tracking-[0.06em] text-muted-foreground">
                    Studio
                  </span>
                </span>
              )}
              {media.source && (
                <span>
                  <span className="font-semibold text-foreground">
                    {media.source.replaceAll("_", " ")}
                  </span>{" "}
                  <span className="text-[0.65rem] uppercase tracking-[0.06em] text-muted-foreground">
                    Source
                  </span>
                </span>
              )}
              {media.season && media.seasonYear && (
                <span>
                  <span className="font-semibold text-foreground">
                    {media.season} {media.seasonYear}
                  </span>{" "}
                  <span className="text-[0.65rem] uppercase tracking-[0.06em] text-muted-foreground">
                    Season
                  </span>
                </span>
              )}
            </div>

            <div className="pt-3 flex flex-wrap items-center gap-3">
              {media.trailer?.id && media.trailer.site === "youtube" && (
                <a
                  href={`https://www.youtube.com/watch?v=${media.trailer.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-signal hover:bg-signal-strong px-4 py-2 text-xs font-semibold text-white shadow-md transition-[transform,background-color] hover:scale-105 active:scale-95"
                >
                  <PlayIcon className="size-3.5 fill-current" /> Watch trailer
                </a>
              )}

              {(() => {
                const streamingLinks = getStreamingLinks(media.externalLinks);
                if (streamingLinks.length === 0) return null;

                return (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[0.62rem] uppercase tracking-wider text-muted-foreground mr-1">
                      Stream on:
                    </span>
                    {streamingLinks.slice(0, 5).map((link) => {
                      const favicon = getFaviconUrl(link.url);
                      return (
                        <a
                          key={link.url}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-md border border-border-soft bg-surface-1/80 px-3 py-1.5 font-mono text-xs font-medium text-foreground transition-[background-color,border-color,color] hover:border-signal hover:text-signal hover:bg-surface-1 shadow-sm"
                        >
                          {favicon ? (
                            <Image
                              src={favicon}
                              alt=""
                              width={14}
                              height={14}
                              className="size-3.5 rounded-sm"
                              unoptimized
                            />
                          ) : (
                            <ExternalLinkIcon className="size-3.5 text-muted-foreground" />
                          )}
                          <span>{link.site}</span>
                        </a>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AnimeHeroSkeleton() {
  return (
    <section className="relative">
      <div className="relative h-[380px] overflow-hidden border-b border-border-soft sm:h-[460px] bg-surface-2 isolate">
        <div className="absolute inset-0 shimmer" />
      </div>
      <div className="relative mx-auto -mt-36 w-full max-w-[1680px] px-4 pb-8 sm:-mt-48 sm:px-7 sm:pb-12 lg:px-10">
        <div className="grid gap-7 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
          <div className="relative mx-auto w-44 shrink-0 self-end sm:mx-0 sm:w-52 lg:w-[220px]">
            <div className="relative aspect-[2/3] overflow-hidden rounded-md border border-border-soft bg-surface-2 shadow-2xl isolate">
              <div className="absolute inset-0 shimmer" />
            </div>
          </div>

          <div className="min-w-0 self-end space-y-4">
            <div className="shimmer h-3.5 w-24 rounded" />
            <div className="shimmer h-10 w-3/4 rounded sm:h-14" />
            <div className="shimmer h-4 w-1/3 rounded" />

            <div className="flex flex-wrap gap-2 pt-1">
              <div className="shimmer h-7 w-20 rounded-md" />
              <div className="shimmer h-7 w-16 rounded-md" />
              <div className="shimmer h-7 w-24 rounded-md" />
              <div className="shimmer h-7 w-16 rounded-md" />
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              <div className="shimmer h-5 w-16 rounded-md" />
              <div className="shimmer h-5 w-20 rounded-md" />
              <div className="shimmer h-5 w-14 rounded-md" />
              <div className="shimmer h-5 w-18 rounded-md" />
            </div>

            <div className="shimmer h-12 w-full max-w-3xl rounded" />
          </div>
        </div>
      </div>
    </section>
  );
}
