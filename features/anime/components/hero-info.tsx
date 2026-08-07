"use client";

import { ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";

import { formatFormat, getMediaTitle, stripHtml } from "@/features/anime/lib/media-helpers";

import type { Media } from "@/features/anime/types/anime";
import type { Route } from "next";

export function HeroInfo({ media }: { media: Media }) {
  const title = getMediaTitle(media);
  const description = stripHtml(media.description);

  return (
    <div className="animate-hero-slide-up space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="eyebrow text-accent">Trending #1</span>
        <span className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
          · Featured Selection
        </span>
      </div>
      <h1 className="line-clamp-2 max-w-3xl text-4xl font-semibold leading-[0.98] tracking-[-0.055em] text-foreground sm:text-5xl lg:text-6xl drop-shadow-md">
        {title}
      </h1>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-muted-foreground">
        {media.averageScore && (
          <span className="font-semibold text-foreground">{(media.averageScore / 10).toFixed(1)} / 10 score</span>
        )}
        {media.format && <span>{formatFormat(media.format)}</span>}
        {media.episodes && <span>{media.episodes} episodes</span>}
        {media.status === "RELEASING" && <span className="text-live-badge font-semibold">Airing now</span>}
      </div>
      {description && (
        <p className="line-clamp-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-4 pt-2">
        <div className="flex flex-wrap gap-2">
          {media.genres.slice(0, 4).map((genre) => (
            <span
              key={genre}
              className="border border-border-soft/80 bg-surface-1/60 px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground backdrop-blur-sm"
            >
              {genre}
            </span>
          ))}
        </div>
        <Link
          href={`/anime/${media.id}` as Route<string>}
          className="inline-flex items-center gap-2 border-b border-accent pb-1 font-mono text-xs uppercase tracking-[0.1em] font-medium text-accent hover:text-foreground transition-colors"
        >
          View anime details <ArrowUpRightIcon className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
