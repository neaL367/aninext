import { ArrowUpRightIcon, PlayIcon, StarIcon } from "lucide-react";
import Link from "next/link";

import { formatFormat, getMediaTitle, stripHtml } from "@/features/anime/lib/media-helpers";

import type { Media } from "@/features/anime/types/anime";
import type { Route } from "next";

export function HeroInfo({ media, rank }: { media: Media; rank?: number }) {
  const title = getMediaTitle(media);
  const description = stripHtml(media.description);

  return (
    <div className="space-y-3.5 max-w-3xl">
      {/* Eyebrow & Badge */}
      <div
        className="animate-stagger-up flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-[0.14em]"
        style={{ animationDelay: "0ms" }}
      >
        <span className="eyebrow text-accent drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
          {rank ? `Rank #${rank}` : "Featured"}
        </span>
        {media.status === "RELEASING" && (
          <span className="text-live-badge font-semibold drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
            · Airing Now
          </span>
        )}
      </div>

      {/* Main Title */}
      <h1
        className="animate-stagger-up line-clamp-2 text-3xl sm:text-5xl lg:text-6xl font-semibold leading-[0.98] tracking-[-0.055em] text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.95)]"
        style={{ animationDelay: "70ms" }}
      >
        {title}
      </h1>

      {/* Metadata Row */}
      <div
        className="animate-stagger-up flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-neutral-300 drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)]"
        style={{ animationDelay: "140ms" }}
      >
        {media.averageScore && (
          <span className="inline-flex items-center gap-1.5 font-semibold text-white">
            <StarIcon className="size-3.5 fill-accent text-accent" />
            {(media.averageScore / 10).toFixed(1)}
            <span className="font-normal text-neutral-400">/ 10</span>
          </span>
        )}
        {media.format && <span>{formatFormat(media.format)}</span>}
        {media.episodes && <span>{media.episodes} episodes</span>}
      </div>

      {/* Synopsis Description */}
      {description && (
        <p
          className="animate-stagger-up line-clamp-2 max-w-2xl text-xs sm:text-sm leading-relaxed text-neutral-200 drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)] font-normal"
          style={{ animationDelay: "210ms" }}
        >
          {description}
        </p>
      )}

      {/* Genre Chips & Actions */}
      <div
        className="animate-stagger-up flex flex-wrap items-center gap-4 pt-1"
        style={{ animationDelay: "280ms" }}
      >
        <div className="flex flex-wrap gap-2">
          {media.genres.slice(0, 4).map((genre) => (
            <span
              key={genre}
              className="border border-white/20 px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-neutral-200 bg-black/60 backdrop-blur-md shadow-sm"
            >
              {genre}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <Link
            href={`/anime/${media.id}` as Route<string>}
            className="inline-flex items-center gap-2 border-b border-accent pb-1 font-mono text-xs uppercase tracking-[0.1em] font-medium text-accent hover:text-white transition-colors drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]"
          >
            Explore Anime <ArrowUpRightIcon className="size-3.5" />
          </Link>
          {media.trailer?.id && media.trailer.site === "youtube" && (
            <a
              href={`https://www.youtube.com/watch?v=${media.trailer.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 border-b border-white/30 pb-1 font-mono text-xs uppercase tracking-[0.1em] text-neutral-300 hover:text-white transition-colors drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]"
            >
              <PlayIcon className="size-3 fill-current" /> Trailer
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
