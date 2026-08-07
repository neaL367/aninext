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
    <div>
      <p className="eyebrow text-accent">Featured anime</p>
      <p className="mt-8 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
        Trending now
      </p>
      <h1
        className="hero-reveal mt-4 line-clamp-3 max-w-xl text-4xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-5xl lg:text-6xl"
        style={{ animationDelay: "80ms" }}
      >
        {title}
      </h1>
      <div
        className="hero-reveal mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-muted-foreground"
        style={{ animationDelay: "180ms" }}
      >
        {media.averageScore && (
          <span className="text-foreground">{(media.averageScore / 10).toFixed(1)} / 10</span>
        )}
        {media.format && <span>{formatFormat(media.format)}</span>}
        {media.episodes && <span>{media.episodes} episodes</span>}
        {media.status === "RELEASING" && <span className="text-live-badge">Airing now</span>}
      </div>
      {description && (
        <p
          className="hero-reveal mt-5 line-clamp-3 max-w-lg text-sm leading-7 text-muted-foreground"
          style={{ animationDelay: "280ms" }}
        >
          {description}
        </p>
      )}
      <div className="hero-reveal mt-5 flex flex-wrap gap-2" style={{ animationDelay: "380ms" }}>
        {media.genres.slice(0, 4).map((genre) => (
          <span
            key={genre}
            className="border border-border px-2 py-1 font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground"
          >
            {genre}
          </span>
        ))}
      </div>
      <Link
        href={`/anime/${media.id}` as Route<string>}
        className="hero-reveal mt-8 inline-flex items-center gap-3 border-b border-accent pb-2 text-sm font-medium text-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        style={{ animationDelay: "480ms" }}
      >
        Open profile <ArrowUpRightIcon className="size-4" />
      </Link>
    </div>
  );
}
