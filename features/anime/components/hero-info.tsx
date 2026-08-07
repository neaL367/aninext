import { ArrowUpRightIcon, PlayIcon, StarIcon } from "lucide-react";
import Link from "next/link";

import { formatFormat, getMediaTitle, stripHtml } from "@/features/anime/lib/media-helpers";

import type { Media } from "@/features/anime/types/anime";
import type { Route } from "next";

export function HeroInfo({ media, rank }: { media: Media; rank?: number }) {
  const title = getMediaTitle(media);
  const description = stripHtml(media.description);

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Eyebrow & Badge */}
      <div
        className="animate-stagger-up flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-[0.14em]"
        style={{ animationDelay: "0ms" }}
      >
        <span className="eyebrow text-accent">
          {rank ? `Rank #${rank}` : "Featured"}
        </span>
        {media.status === "RELEASING" && (
          <span className="text-live-badge font-semibold">
            · Airing Now
          </span>
        )}
      </div>

      {/* Main Title */}
      <h1
        className="animate-stagger-up line-clamp-2 text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[0.98] tracking-[-0.055em] text-foreground drop-shadow-md"
        style={{ animationDelay: "70ms" }}
      >
        {title}
      </h1>

      {/* Metadata Row */}
      <div
        className="animate-stagger-up flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-muted-foreground"
        style={{ animationDelay: "140ms" }}
      >
        {media.averageScore && (
          <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
            <StarIcon className="size-3.5 fill-accent text-accent" />
            {(media.averageScore / 10).toFixed(1)}
            <span className="font-normal text-muted-foreground">/ 10</span>
          </span>
        )}
        {media.format && <span>{formatFormat(media.format)}</span>}
        {media.episodes && <span>{media.episodes} episodes</span>}
      </div>

      {/* Synopsis Description */}
      {description && (
        <p
          className="animate-stagger-up line-clamp-2 max-w-2xl text-sm leading-relaxed text-muted-foreground"
          style={{ animationDelay: "210ms" }}
        >
          {description}
        </p>
      )}

      {/* Genre Chips & Actions */}
      <div
        className="animate-stagger-up flex flex-wrap items-center gap-4 pt-2"
        style={{ animationDelay: "280ms" }}
      >
        <div className="flex flex-wrap gap-2">
          {media.genres.slice(0, 4).map((genre) => (
            <span
              key={genre}
              className="border border-border-soft px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-muted-foreground bg-surface-1/80 backdrop-blur-sm"
            >
              {genre}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <Link
            href={`/anime/${media.id}` as Route<string>}
            className="inline-flex items-center gap-2 border-b border-accent pb-1 font-mono text-xs uppercase tracking-[0.1em] font-medium text-accent hover:text-foreground transition-colors"
          >
            Explore Anime <ArrowUpRightIcon className="size-3.5" />
          </Link>
          {media.trailer?.id && media.trailer.site === "youtube" && (
            <a
              href={`https://www.youtube.com/watch?v=${media.trailer.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 border-b border-border-soft pb-1 font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground transition-colors"
            >
              <PlayIcon className="size-3 fill-current" /> Trailer
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
