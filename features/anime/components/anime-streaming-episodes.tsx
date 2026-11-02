import { ExternalLinkIcon, PlayIcon } from "lucide-react";
import Image from "next/image";

import {
  isSafeExternalUrl,
  getStreamingLinks,
  getFaviconUrl,
} from "@/features/anime/lib/media-helpers";

import { EmptyState } from "./empty-state";

import type { Media, MediaExternalLink, StreamingEpisode } from "@/features/anime/types/anime";

export function AnimeStreamingEpisodes({ media }: { media: Media }) {
  "use memo";
  const episodes = media.streamingEpisodes?.filter(hasSafeStreamingUrl);

  if (episodes && episodes.length > 0) return <EpisodeList episodes={episodes} />;

  // AniList rarely indexes per-episode entries for current-season titles
  // (verified: trending rows return []) while externalLinks still carries
  // STREAMING sites. Fall back to site links instead of an empty panel.
  const sites = getStreamingLinks(media.externalLinks).filter((link) =>
    isSafeExternalUrl(link.url),
  );
  if (sites.length > 0) return <SiteList sites={sites} />;

  return <EmptyState icon={PlayIcon} title="No streams" />;
}

function EpisodeList({ episodes }: { episodes: (StreamingEpisode & { url: string })[] }) {
  return (
    <div className="max-h-[420px] overflow-y-auto scrollbar-thin">
      <div className="divide-y divide-border-soft border-t border-border-soft">
        {episodes.map((ep, i) => (
          <a
            key={`${ep.url}-${i}`}
            href={ep.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 px-1 py-2.5 transition-colors hover:bg-surface-1/40"
          >
            {ep.thumbnail ? (
              <div className="relative h-[54px] w-[96px] shrink-0 overflow-hidden rounded border border-border-soft bg-surface-2">
                <Image
                  src={ep.thumbnail}
                  alt=""
                  fill
                  sizes="96px"
                  unoptimized
                  className="object-cover transition-transform duration-300 group-hover:scale-105 transform-gpu"
                />
              </div>
            ) : (
              <span className="flex size-[54px] shrink-0 items-center justify-center rounded border border-border-soft font-mono text-sm text-muted-foreground bg-surface-1">
                {String(i + 1).padStart(2, "0")}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-xs sm:text-sm font-semibold text-foreground group-hover:text-signal transition-colors">
                {ep.title || `Episode ${i + 1}`}
              </p>
              {ep.site && (
                <p className="mt-0.5 font-mono text-[0.65rem] uppercase tracking-[0.06em] text-muted-foreground">
                  {ep.site}
                </p>
              )}
            </div>
            <ExternalLinkIcon className="size-3.5 shrink-0 text-muted-foreground group-hover:text-signal transition-colors" />
          </a>
        ))}
      </div>
    </div>
  );
}

function SiteList({ sites }: { sites: MediaExternalLink[] }) {
  return (
    <div className="max-h-[420px] overflow-y-auto scrollbar-thin">
      <div className="divide-y divide-border-soft border-t border-border-soft">
        {sites.map((link) => {
          const favicon = getFaviconUrl(link.url);
          return (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 px-1 py-2.5 transition-colors hover:bg-surface-1/40"
            >
              <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-[2px] bg-surface-1">
                {favicon ? (
                  <Image
                    src={favicon}
                    alt=""
                    width={22}
                    height={22}
                    unoptimized
                    className="size-5 rounded-[2px]"
                  />
                ) : (
                  <PlayIcon className="size-4 text-muted-foreground" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 font-serif text-sm text-foreground transition-colors group-hover:text-signal">
                  Watch on {link.site}
                </p>
                <p className="mt-0.5 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-muted-foreground/70">
                  Streaming
                </p>
              </div>
              <ExternalLinkIcon className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-signal" />
            </a>
          );
        })}
      </div>
    </div>
  );
}

function hasSafeStreamingUrl(
  episode: StreamingEpisode,
): episode is StreamingEpisode & { url: string } {
  return isSafeExternalUrl(episode.url);
}

export function AnimeStreamingEpisodesSkeleton() {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3">
          <div className="shimmer h-[54px] w-[96px]" />
          <div className="flex-1 space-y-2">
            <div className="shimmer h-3 w-3/4 rounded" />
            <div className="shimmer h-2.5 w-1/3 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
