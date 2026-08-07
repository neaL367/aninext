import { ArrowRightIcon, PlayIcon, StarIcon } from "lucide-react";

import { HoverPrefetchLink } from "@/components/ui/hover-prefetch-link";
import { formatFormat, getMediaTitle, stripHtml } from "@/features/anime/lib/media-helpers";

import type { Media } from "@/features/anime/types/anime";
import type { Route } from "next";

export function HeroInfo({ media, rank }: { media: Media; rank?: number }) {
  const title = getMediaTitle(media);
  const description = stripHtml(media.description);

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Eyebrow & Status */}
      <div className="animate-stagger-up flex items-center gap-3 font-mono text-xs uppercase tracking-[0.14em]">
        <p className="eyebrow">
          {rank ? `Ranked #${rank}` : "Featured selection"}
        </p>
        {media.status === "RELEASING" && (
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-live-badge font-semibold">
            · Airing now
          </span>
        )}
      </div>

      {/* Main Title */}
      <h1
        className="animate-stagger-up line-clamp-2 text-3xl font-semibold tracking-[-0.055em] text-foreground sm:text-5xl lg:text-6xl"
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
            <StarIcon className="size-3.5 fill-signal text-signal" />
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
          className="animate-stagger-up line-clamp-2 max-w-2xl text-sm leading-6 text-muted-foreground"
          style={{ animationDelay: "210ms" }}
        >
          {description}
        </p>
      )}

      {/* Genre Chips & Actions */}
      <div
        className="animate-stagger-up flex flex-wrap items-center gap-5 pt-2"
        style={{ animationDelay: "280ms" }}
      >
        <div className="flex flex-wrap gap-2">
          {media.genres.slice(0, 4).map((genre) => (
            <span
              key={genre}
              className="border border-border-soft bg-surface-1 px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-muted-foreground"
            >
              {genre}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <HoverPrefetchLink
            href={`/anime/${media.id}` as Route<string>}
            className="group flex items-center gap-2 border-b border-border-soft pb-1 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:border-signal hover:text-signal"
          >
            Explore anime{" "}
            <ArrowRightIcon className="size-3 transition-transform group-hover:translate-x-1" />
          </HoverPrefetchLink>
          {media.trailer?.id && media.trailer.site === "youtube" && (
            <a
              href={`https://www.youtube.com/watch?v=${media.trailer.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 border-b border-border-soft pb-1 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
            >
              <PlayIcon className="size-3 fill-current" /> Trailer
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
