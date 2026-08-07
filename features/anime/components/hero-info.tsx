import { ArrowRightIcon, PlayIcon, StarIcon } from "lucide-react";
import Link from "next/link";

import { formatFormat, getMediaTitle, stripHtml } from "@/features/anime/lib/media-helpers";

import type { Media } from "@/features/anime/types/anime";
import type { Route } from "next";

export function HeroInfo({ media, rank }: { media: Media; rank?: number }) {
  const title = getMediaTitle(media);
  const description = stripHtml(media.description);
  const studio = media.studios?.nodes[0]?.name;

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Eyebrow Badge */}
      <div
        className="animate-stagger-up flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-[0.14em]"
        style={{ animationDelay: "0ms" }}
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/15 px-3 py-1 text-accent backdrop-blur-md">
          <span className="size-1.5 rounded-full bg-accent animate-pulse" />
          {rank ? `Rank #${rank}` : "Featured"}
        </span>
        {media.status === "RELEASING" && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-live-badge/40 bg-live-badge/15 px-3 py-1 text-live-badge backdrop-blur-md font-semibold">
            <span className="size-1.5 rounded-full bg-live-badge animate-ping" />
            Airing Now
          </span>
        )}
      </div>

      {/* Main Title */}
      <h1
        className="animate-stagger-up line-clamp-2 text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)] leading-[0.95]"
        style={{ animationDelay: "70ms" }}
      >
        {title}
      </h1>

      {/* Metadata Pills */}
      <div
        className="animate-stagger-up flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs sm:text-sm text-neutral-300"
        style={{ animationDelay: "140ms" }}
      >
        {media.averageScore && (
          <span className="inline-flex items-center gap-1.5 font-bold text-amber-400">
            <StarIcon className="size-4 fill-amber-400 text-amber-400" />
            {(media.averageScore / 10).toFixed(1)}
            <span className="font-normal text-neutral-400">/ 10</span>
          </span>
        )}
        {media.format && <span>{formatFormat(media.format)}</span>}
        {media.episodes && <span>{media.episodes} Episodes</span>}
        {studio && <span className="text-white/80 font-medium">{studio}</span>}
      </div>

      {/* Synopsis Description */}
      {description && (
        <p
          className="animate-stagger-up line-clamp-3 max-w-2xl text-sm sm:text-base leading-relaxed text-neutral-200/90 drop-shadow-sm font-normal"
          style={{ animationDelay: "210ms" }}
        >
          {description}
        </p>
      )}

      {/* Genre Chips & Primary/Secondary CTAs */}
      <div
        className="animate-stagger-up flex flex-wrap items-center gap-4 pt-2"
        style={{ animationDelay: "280ms" }}
      >
        <div className="flex flex-wrap gap-2">
          {media.genres.slice(0, 4).map((genre) => (
            <span
              key={genre}
              className="rounded-md border border-white/20 bg-black/40 px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-neutral-200 backdrop-blur-md shadow-sm"
            >
              {genre}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/anime/${media.id}` as Route<string>}
            className="group inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-[0.1em] text-black transition-all duration-300 hover:bg-accent hover:text-white shadow-lg hover:scale-105 active:scale-95"
          >
            Explore Anime <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
          {media.trailer?.id && media.trailer.site === "youtube" && (
            <a
              href={`https://www.youtube.com/watch?v=${media.trailer.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-black/30 px-4 py-2.5 font-mono text-xs font-medium uppercase tracking-[0.1em] text-white backdrop-blur-md transition-all hover:bg-white/20 hover:border-white/50"
            >
              <PlayIcon className="size-3.5 fill-white" /> Trailer
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
