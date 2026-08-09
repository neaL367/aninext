import { PlayIcon } from "lucide-react";

import { MediaImage } from "@/components/ui/media-image";

import type { Media } from "@/features/anime/types/anime";

export function AnimeTrailer({ media }: { media: Media }) {
  "use memo";
  const trailer = media.trailer;
  if (!trailer?.id || trailer.site !== "youtube")
    return (
      <div className="flex min-h-32 items-center border border-dashed border-border-soft px-5 font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground">
        No trailer indexed
      </div>
    );

  const youtubeUrl = `https://www.youtube.com/watch?v=${trailer.id}`;
  const thumbnail =
    trailer.thumbnail || `https://img.youtube.com/vi/${trailer.id}/maxresdefault.jpg`;

  return (
    <a
      href={youtubeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block aspect-video overflow-hidden rounded-md border border-border-soft bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal isolate transform-gpu shadow-lg"
    >
      <MediaImage
        src={thumbnail}
        alt="Trailer thumbnail"
        fill
        unoptimized
        sizes="(max-width: 1024px) 100vw, 55vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105 transform-gpu will-change-transform"
      />
      <div className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/40" />
      <div className="absolute bottom-4 left-4 flex items-center gap-3 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-white">
        <span className="flex size-9 items-center justify-center rounded bg-signal text-white shadow-md">
          <PlayIcon className="size-3.5 fill-current" />
        </span>{" "}
        Watch trailer
      </div>
    </a>
  );
}

export function AnimeTrailerSkeleton() {
  return <div className="shimmer aspect-video w-full border border-border-soft" />;
}
