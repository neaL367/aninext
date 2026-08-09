import { PlayIcon } from "lucide-react";

import { ViewAllLink } from "@/components/ui/view-all-link";
import { formatFormat, getMediaTitle, stripHtml } from "@/features/anime/lib/media-helpers";

import { ScoreBadge } from "./score-badge";

import type { Media } from "@/features/anime/types/anime";

export function HeroInfo({ media, rank }: { media: Media; rank?: number }) {
  "use memo";
  const title = getMediaTitle(media);
  const description = stripHtml(media.description);

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Eyebrow */}
      <div className="animate-stagger-up flex items-center gap-3 font-mono text-xs uppercase tracking-[0.14em]">
        <p className="eyebrow">{rank ? `Ranked #${rank}` : "Featured selection"}</p>
      </div>

      {/* Main Title */}
      <h1
        className="animate-stagger-up line-clamp-2 text-3xl font-semibold tracking-[-0.055em] text-foreground sm:text-5xl lg:text-6xl"
        style={{ animationDelay: "70ms" }}
      >
        {title}
      </h1>

      {/* Metadata Row Below Title */}
      <div
        className="animate-stagger-up flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-muted-foreground"
        style={{ animationDelay: "140ms" }}
      >
        {media.averageScore && <ScoreBadge score={media.averageScore} suffix="/ 10" />}
        {media.format && <span>{formatFormat(media.format)}</span>}
        {media.episodes && <span>{media.episodes} episodes</span>}
        {media.season && media.seasonYear && (
          <span>
            {media.season} {media.seasonYear}
          </span>
        )}
        {media.status === "RELEASING" ? (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/15 px-2 py-0.5 font-mono text-[0.65rem] font-bold uppercase text-destructive">
            <span className="size-1.5 rounded-full bg-destructive animate-pulse" />
            Airing now
          </span>
        ) : media.status ? (
          <span className="rounded-md border border-border-soft bg-surface-1 px-2 py-0.5 font-mono text-[0.65rem] text-muted-foreground uppercase">
            {media.status.replaceAll("_", " ")}
          </span>
        ) : null}
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
          <ViewAllLink href={`/anime/${media.id}` as import("next").Route}>
            Explore anime
          </ViewAllLink>
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
