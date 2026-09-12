"use client";

import { PlayIcon, XIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { MediaImage } from "@/components/ui/media-image";

import type { Media } from "@/features/anime/types/anime";

export function AnimeTrailer({ media }: { media: Media }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const trailer = media.trailer;
  const pathname = usePathname();
  const currentPathname = useRef(pathname);

  const stopPlayback = useCallback(() => {
    if (iframeRef.current) {
      try {
        iframeRef.current.contentWindow?.postMessage(
          '{"event":"command","func":"stopVideo","args":""}',
          "*",
        );
        iframeRef.current.contentWindow?.postMessage(
          '{"event":"command","func":"pauseVideo","args":""}',
          "*",
        );
      } catch {
        // Ignore cross-origin errors
      }
    }
    setIsPlaying(false);
  }, []);

  // Stop playback if the route changes to another page
  useEffect(() => {
    if (pathname !== currentPathname.current) {
      currentPathname.current = pathname;
      stopPlayback();
    }
  }, [pathname, stopPlayback]);

  // Stop playback on navigation (links, browser Back/Forward, page hide, unmount)
  useEffect(() => {
    if (!isPlaying) return;

    const handleLinkClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest?.("a");
      if (anchor && anchor.href && !anchor.getAttribute("href")?.startsWith("#")) {
        stopPlayback();
      }
    };

    window.addEventListener("popstate", stopPlayback);
    window.addEventListener("pagehide", stopPlayback);
    document.addEventListener("click", handleLinkClick, { capture: true });

    return () => {
      window.removeEventListener("popstate", stopPlayback);
      window.removeEventListener("pagehide", stopPlayback);
      document.removeEventListener("click", handleLinkClick, { capture: true });
      stopPlayback();
    };
  }, [isPlaying, stopPlayback]);

  if (!trailer?.id || trailer.site !== "youtube") {
    return (
      <div className="flex min-h-32 items-center border border-dashed border-border-soft px-5 font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground">
        No trailer indexed
      </div>
    );
  }

  const thumbnail =
    trailer.thumbnail || `https://img.youtube.com/vi/${trailer.id}/maxresdefault.jpg`;
  const title = media.title.english || media.title.romaji || media.title.native || "Anime";

  return (
    <div
      id="trailer"
      className="group relative block aspect-video overflow-hidden rounded-md border border-border-soft bg-surface-2 isolate transform-gpu shadow-lg scroll-mt-24"
    >
      {isPlaying ? (
        <>
          <iframe
            ref={iframeRef}
            src={`https://www.youtube-nocookie.com/embed/${trailer.id}?autoplay=1&enablejsapi=1&rel=0`}
            title={`${title} Trailer`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 size-full border-0"
          />
          <button
            type="button"
            onClick={stopPlayback}
            className="absolute top-3 right-3 z-20 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/80 text-white shadow-lg backdrop-blur-md transition-transform hover:scale-110 hover:bg-black active:scale-95"
            aria-label="Close trailer"
          >
            <XIcon className="size-4" />
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setIsPlaying(true)}
          className="relative size-full cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
          aria-label="Watch trailer"
        >
          <MediaImage
            src={thumbnail}
            alt="Trailer thumbnail"
            fill
            unoptimized
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105 transform-gpu will-change-transform"
          />
          <div className="absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/45" />

          <div className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-signal text-white shadow-xl transition-[transform,background-color] group-hover:scale-110 group-hover:bg-signal-strong active:scale-95">
              <PlayIcon className="size-6 fill-current ml-0.5" />
            </span>
          </div>

          <div className="absolute bottom-4 left-4 flex items-center gap-3 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-white drop-shadow-md">
            <span>Watch trailer</span>
          </div>
        </button>
      )}
    </div>
  );
}

export function AnimeTrailerSkeleton() {
  return <div className="shimmer aspect-video w-full rounded-md border border-border-soft" />;
}
