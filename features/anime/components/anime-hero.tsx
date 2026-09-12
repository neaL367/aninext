import { ExternalLinkIcon, PlayIcon } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";

import { MediaImage } from "@/components/ui/media-image";
import { getAnimePageBatch } from "@/features/anime/anime-queries";
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

  const { media } = await getAnimePageBatch(id);
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
      <div className="relative h-[280px] overflow-hidden sm:h-[350px] lg:h-[400px]">
        {banner ? (
          <MediaImage
            src={banner}
            alt=""
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover object-center transform-gpu"
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
        {/* Fade blur black: progressive backdrop blur at the bottom of the banner */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-44 sm:h-56 backdrop-blur-md"
          style={{
            maskImage:
              "linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.4) 35%, black 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.4) 35%, black 100%)",
          }}
        />
        {/* Smooth multi-stop cinematic black gradient fading seamlessly into black */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0, 0, 0, 0.5) 0%, transparent 20%, transparent 40%, rgba(0, 0, 0, 0.3) 60%, rgba(0, 0, 0, 0.72) 80%, rgba(0, 0, 0, 0.95) 93%, #000000 100%), linear-gradient(to right, rgba(0, 0, 0, 0.35) 0%, transparent 12%, transparent 88%, rgba(0, 0, 0, 0.35) 100%)",
          }}
        />
      </div>

      <div className="relative mx-auto -mt-20 w-full max-w-[1680px] px-4 pb-8 sm:-mt-28 lg:-mt-32 sm:px-7 sm:pb-12 lg:px-10">
        <div className="grid gap-7 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10">
          <div className="relative mx-auto w-52 shrink-0 self-end sm:mx-0 sm:w-60 lg:w-[280px]">
            <div
              className="relative aspect-[2/3] overflow-hidden rounded-md border border-white/10 bg-surface-2 shadow-2xl isolate transform-gpu"
              style={{
                ...(color ? { backgroundColor: color } : undefined),
                boxShadow:
                  "0 30px 60px -12px rgba(0, 0, 0, 0.85), 0 18px 36px -18px rgba(0, 0, 0, 0.7)",
              }}
            >
              {cover ? (
                <ViewTransition name={`anime-cover-${media.id}`} share="morph" default="none">
                  <MediaImage
                    src={cover}
                    alt={`${title} cover`}
                    fill
                    priority
                    sizes="280px"
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
            <h1 className="text-4xl font-semibold leading-[0.98] tracking-[-0.055em] text-white sm:text-6xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              {title}
            </h1>
            {media.title.native && (
              <p className="text-sm font-mono text-zinc-200 drop-shadow-sm">{media.title.native}</p>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs pt-1">
              {media.averageScore && (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-black/50 border border-white/20 px-2.5 py-1 text-xs font-bold text-signal backdrop-blur-md shadow-sm">
                  {(media.averageScore / 10).toFixed(1)}
                  <span className="text-[0.65rem] font-medium text-zinc-300">score</span>
                </span>
              )}
              {media.format && (
                <span className="rounded-md border border-white/20 bg-black/50 px-2 py-1 text-zinc-100 font-medium backdrop-blur-md shadow-sm">
                  {formatFormat(media.format)}
                </span>
              )}
              {media.episodes && (
                <span className="rounded-md border border-white/20 bg-black/50 px-2 py-1 text-zinc-100 font-medium backdrop-blur-md shadow-sm">
                  {media.episodes} episodes
                </span>
              )}
              {media.duration && (
                <span className="rounded-md border border-white/20 bg-black/50 px-2 py-1 text-zinc-100 font-medium backdrop-blur-md shadow-sm">
                  {media.duration} min
                </span>
              )}
              {media.status && (
                <span
                  className={cn(
                    "rounded-md border px-2 py-1 font-semibold backdrop-blur-md shadow-sm",
                    media.status === "RELEASING"
                      ? "border-red-500/40 bg-red-950/60 text-red-300"
                      : "border-white/20 bg-black/50 text-zinc-100",
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
                    className="rounded-md border border-white/20 bg-black/45 px-2.5 py-0.5 font-mono text-[0.62rem] uppercase tracking-wider text-zinc-200 font-medium backdrop-blur-md shadow-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {description && (
              <p className="max-w-3xl text-sm sm:text-base leading-relaxed text-zinc-100 font-normal pt-1 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
                {description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs pt-2 font-mono drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
              {studio && (
                <span>
                  <span className="font-semibold text-white">{studio}</span>{" "}
                  <span className="text-[0.65rem] uppercase tracking-[0.06em] text-zinc-300">
                    Studio
                  </span>
                </span>
              )}
              {media.source && (
                <span>
                  <span className="font-semibold text-white">
                    {media.source.replaceAll("_", " ")}
                  </span>{" "}
                  <span className="text-[0.65rem] uppercase tracking-[0.06em] text-zinc-300">
                    Source
                  </span>
                </span>
              )}
              {media.season && media.seasonYear && (
                <span>
                  <span className="font-semibold text-white">
                    {media.season} {media.seasonYear}
                  </span>{" "}
                  <span className="text-[0.65rem] uppercase tracking-[0.06em] text-zinc-300">
                    Season
                  </span>
                </span>
              )}
            </div>

            <div className="pt-3 flex flex-wrap items-center gap-3">
              {media.trailer?.id && media.trailer.site === "youtube" && (
                <a
                  href="#trailer"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-signal hover:bg-signal-strong px-4 py-2 text-xs font-semibold text-white shadow-md transition-[transform,background-color] hover:scale-105 active:scale-95"
                >
                  <PlayIcon className="size-3.5 fill-current" /> Watch trailer
                </a>
              )}

              {(() => {
                const streamingLinks = getStreamingLinks(media.externalLinks);
                if (streamingLinks.length === 0) return null;

                return (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[0.62rem] uppercase tracking-wider text-zinc-300 mr-1">
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
                          className="inline-flex items-center gap-1.5 rounded-md border border-white/20 bg-black/50 px-3 py-1.5 font-mono text-xs font-medium text-zinc-100 transition-[background-color,border-color,color] hover:border-signal hover:text-signal hover:bg-black/70 shadow-sm backdrop-blur-md"
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
                            <ExternalLinkIcon className="size-3.5 text-zinc-300" />
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
      <div className="relative h-[280px] overflow-hidden sm:h-[350px] lg:h-[400px] isolate">
        <div className="absolute inset-0 shimmer" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, transparent 30%, rgba(0, 0, 0, 0.7) 75%, #000000 100%)",
          }}
        />
      </div>
      <div className="relative mx-auto -mt-20 w-full max-w-[1680px] px-4 pb-8 sm:-mt-28 lg:-mt-32 sm:px-7 sm:pb-12 lg:px-10">
        <div className="grid gap-7 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10">
          <div className="relative mx-auto w-52 shrink-0 self-end sm:mx-0 sm:w-60 lg:w-[280px]">
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

            <div className="shimmer h-20 w-full max-w-3xl rounded" />
          </div>
        </div>
      </div>
    </section>
  );
}
