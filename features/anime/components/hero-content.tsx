"use client";

import Image from "next/image";
import type { Route } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HoverPrefetchLink } from "@/components/hover-prefetch-link";
import type { Media } from "@/features/anime/types/anime";
import { getMediaTitle, getMediaCover } from "@/features/anime/lib/media-helpers";
import { PlayIcon } from "lucide-react";

export function HeroContent({ media, showGenres }: { media: Media; showGenres?: boolean }) {
  const title = getMediaTitle(media);
  const banner = media.bannerImage ?? media.coverImage.extraLarge;
  const cover = getMediaCover(media);

  return (
    <div className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
      {banner && (
        <Image
          src={banner}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/30 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 flex items-end gap-6 p-6 sm:gap-8 sm:p-10 lg:p-16">
        {cover && (
          <div className="hidden w-44 shrink-0 sm:block lg:w-56">
            <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-border/40 shadow-2xl">
              <Image
                src={cover}
                alt={`${title} cover`}
                fill
                priority
                className="object-cover"
              />
            </div>
          </div>
        )}
        <div className="flex flex-1 flex-col gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl [text-shadow:0_2px_20px_rgba(0,0,0,0.8)]">
            {title}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            {media.averageScore && (
              <Badge className="font-mono tabular-nums">
                {(media.averageScore / 10).toFixed(1)}
              </Badge>
            )}
            {media.format && (
              <Badge
                variant="secondary"
                className="rounded-md border-none bg-secondary/80 font-mono text-[11px] font-medium uppercase tracking-wide backdrop-blur-sm"
              >
                {media.format}
              </Badge>
            )}
            {media.episodes && (
              <span className="font-mono text-sm text-white/70 tabular-nums">
                {media.episodes} episodes
              </span>
            )}
            {showGenres &&
              media.genres.slice(0, 3).map((g) => (
                <span
                  key={g}
                  className="rounded-md border border-white/20 bg-white/5 px-2 py-0.5 text-xs text-white/80 backdrop-blur-sm"
                >
                  {g}
                </span>
              ))}
          </div>
          {media.description && (
            <p className="line-clamp-3 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
              {media.description.replace(/<[^>]*>/g, "")}
            </p>
          )}
          <div className="flex items-center gap-3 pt-2">
            <Button
              nativeButton={false}
              render={<HoverPrefetchLink href={`/anime/${media.id}` as Route<string>} />}
              size="lg"
              className="bg-accent text-accent-foreground transition-all hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/20"
            >
              <PlayIcon className="size-4 fill-current" />
              View Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
