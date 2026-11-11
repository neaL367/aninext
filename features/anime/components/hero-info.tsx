import { ArrowRightIcon, PlayIcon } from "lucide-react";
import Link from "next/link";

import { formatFormat, getMediaTitle, stripHtml } from "@/features/anime/lib/media-helpers";

import { MediaScore } from "./media-score";

import type { Media } from "@/features/anime/types/anime";
import type { Route } from "next";

export function HeroInfo({ media }: { media: Media }) {
  "use memo";
  const title = getMediaTitle(media);
  const description = stripHtml(media.description);
  const meta = [
    media.format ? formatFormat(media.format) : null,
    media.episodes ? `${media.episodes} episodes` : null,
    media.seasonYear,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="max-w-3xl">
      <p className="reveal-up font-mono text-[0.8125rem] uppercase tracking-[0.16em] text-signal">
        Featured
      </p>

      <h1
        className="reveal-up display-tight mt-3 line-clamp-2 text-[clamp(2.8rem,7.5vw,6.6rem)] text-foreground"
        style={{ animationDelay: "80ms" }}
      >
        {title}
      </h1>

      <div
        className="reveal-up mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[0.875rem] uppercase tracking-[0.1em] text-muted-foreground"
        style={{ animationDelay: "160ms" }}
      >
        {media.averageScore !== undefined && (
          <MediaScore score={media.averageScore} className="text-[0.875rem] text-foreground" />
        )}
        {meta && <span>{meta}</span>}
        {media.status === "RELEASING" && (
          <span className="flex items-center gap-1.5 text-signal">
            <span className="size-1 rounded-full bg-signal" />
            Airing
          </span>
        )}
      </div>

      {description && (
        <p
          className="reveal-up mt-5 line-clamp-2 max-w-xl text-[0.95rem] leading-7 text-muted-foreground"
          style={{ animationDelay: "240ms" }}
        >
          {description}
        </p>
      )}

      <div
        className="reveal-up mt-7 flex flex-wrap items-center gap-x-7 gap-y-3"
        style={{ animationDelay: "320ms" }}
      >
        <Link
          href={`/anime/${media.id}` as Route<string>}
          className="group inline-flex min-h-10 items-center gap-2 font-mono text-[0.875rem] uppercase tracking-[0.16em] text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
        >
          Open title
          <ArrowRightIcon className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
        {media.trailer?.id && media.trailer.site === "youtube" && (
          <a
            href={`https://www.youtube.com/watch?v=${media.trailer.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center gap-2 font-mono text-[0.875rem] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
          >
            <PlayIcon className="size-3 fill-current" />
            Trailer
          </a>
        )}
      </div>
    </div>
  );
}
