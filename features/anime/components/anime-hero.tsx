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

import { MediaScore } from "./media-score";

import type { Media } from "@/features/anime/types/anime";

export async function AnimeHeroSection({ id }: { id: number | null }) {
  if (id === null) notFound();

  const { media } = await getAnimePageBatch(id);
  if (!media) notFound();
  return <AnimeHero media={media} />;
}

export function AnimeHero({ media }: { media: Media }) {
  const title = getMediaTitle(media);
  const cover = getMediaCover(media, "extraLarge");
  const banner = media.bannerImage;
  const color = media.coverImage.color;
  const description = stripHtml(media.description);
  const studio = media.studios?.nodes[0]?.name;
  const streamingLinks = getStreamingLinks(media.externalLinks);

  return (
    <section className="relative">
      <div className="relative h-[300px] overflow-hidden sm:h-[380px] lg:h-[440px]">
        {banner ? (
          <MediaImage
            src={banner}
            alt=""
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover object-[50%_30%]"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: color
                ? `linear-gradient(120deg, ${color}70, var(--surface-2) 75%)`
                : "linear-gradient(120deg, var(--surface-2), var(--background) 75%)",
            }}
          />
        )}
        {/* Progressive frosted falloff: sharp banner at the top, deep blur under
            the overlapping cover and title so the artwork melts into the page. */}
        <div
          aria-hidden="true"
          className="mask-fade-b pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-b from-transparent via-background/10 to-background/25 backdrop-blur-[2px] backdrop-saturate-[1.15] sm:h-56 lg:h-64"
        />
        <div
          aria-hidden="true"
          className="mask-fade-b pointer-events-none absolute inset-x-0 bottom-0 h-28 backdrop-blur-2xl backdrop-saturate-150 sm:h-36 lg:h-44"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/35 to-background/5" />
      </div>

      <div className="relative mx-auto -mt-24 w-full max-w-[1760px] px-4 pb-10 sm:-mt-32 sm:px-7 lg:-mt-36 lg:px-10">
        <div className="grid grid-cols-1 gap-7 lg:grid-cols-[250px_minmax(0,1fr)] lg:items-end lg:gap-10">
          <div className="relative mx-auto w-40 shrink-0 sm:mx-0 sm:w-52 lg:w-[250px]">
            <div
              className="relative aspect-[2/3] overflow-hidden rounded-[3px] bg-surface-2 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)]"
              style={color ? { backgroundColor: color } : undefined}
            >
              {cover ? (
                <ViewTransition name={`anime-cover-${media.id}`} share="morph" default="none">
                  <MediaImage
                    src={cover}
                    alt={`${title} cover`}
                    fill
                    priority
                    sizes="250px"
                    className="object-cover"
                  />
                </ViewTransition>
              ) : (
                <div className="flex h-full items-center justify-center p-6 text-center">
                  <span className="font-serif text-sm leading-tight text-paper/80">{title}</span>
                </div>
              )}
            </div>
          </div>

          <div className="min-w-0 self-end">
            <h1
              className="display-tight line-clamp-2 text-[clamp(2.4rem,5.5vw,5rem)] text-white"
              data-testid="anime-title"
            >
              {title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-white/60">
              {media.averageScore !== undefined && (
                <MediaScore score={media.averageScore} className="text-[0.8rem] text-white" />
              )}
              {media.format && <span>{formatFormat(media.format)}</span>}
              {media.episodes && <span>{media.episodes} episodes</span>}
              {media.duration && <span>{media.duration} min</span>}
              {studio && <span className="text-white/80">{studio}</span>}
              {media.status && (
                <span
                  className={cn(
                    "flex items-center gap-1.5",
                    media.status === "RELEASING" ? "text-signal" : "text-white/60",
                  )}
                >
                  {media.status === "RELEASING" && (
                    <span className="size-1 rounded-full bg-signal" />
                  )}
                  {formatStatus(media.status)}
                </span>
              )}
            </div>

            {description && (
              <p className="mt-4 line-clamp-3 max-w-3xl text-sm leading-6 text-white/70">
                {description}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              {media.trailer?.id && media.trailer.site === "youtube" && (
                <a
                  href="#trailer"
                  className="inline-flex min-h-9 items-center gap-2 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-white transition-colors hover:text-signal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
                >
                  <PlayIcon className="size-3 fill-current" /> Trailer
                </a>
              )}
              {streamingLinks.slice(0, 4).map((link) => {
                const favicon = getFaviconUrl(link.url);
                return (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-mono text-[0.66rem] uppercase tracking-[0.12em] text-white/60 transition-colors hover:text-white"
                  >
                    {favicon ? (
                      <Image
                        src={favicon}
                        alt=""
                        width={14}
                        height={14}
                        className="size-3.5 rounded-[2px]"
                        unoptimized
                      />
                    ) : (
                      <ExternalLinkIcon className="size-3" />
                    )}
                    {link.site}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AnimeHeroSkeleton() {
  return (
    <section className="relative" data-testid="anime-hero-skeleton">
      <div className="relative h-[300px] overflow-hidden sm:h-[380px] lg:h-[440px]">
        <div className="absolute inset-0 shimmer" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>
      <div className="relative mx-auto -mt-24 w-full max-w-[1760px] px-4 pb-10 sm:-mt-32 sm:px-7 lg:-mt-36 lg:px-10">
        <div className="grid grid-cols-1 gap-7 lg:grid-cols-[250px_minmax(0,1fr)] lg:items-end lg:gap-10">
          <div className="relative mx-auto w-40 shrink-0 sm:mx-0 sm:w-52 lg:w-[250px]">
            <div className="relative aspect-[2/3] overflow-hidden rounded-[3px] bg-surface-2">
              <div className="absolute inset-0 shimmer" />
            </div>
          </div>
          <div className="min-w-0 self-end space-y-4">
            <div className="shimmer h-12 w-4/5 rounded-[2px] sm:h-16" />
            <div className="shimmer h-3.5 w-2/5 rounded-[2px]" />
            <div className="shimmer h-16 w-full max-w-2xl rounded-[2px]" />
            <div className="shimmer h-4 w-40 rounded-[2px]" />
          </div>
        </div>
      </div>
    </section>
  );
}
