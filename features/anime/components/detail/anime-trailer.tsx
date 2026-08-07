import { PlayIcon } from "lucide-react";

import { ImageWithLoading } from "@/components/ui/image-with-loading";

import type { Media } from "@/features/anime/types/anime";

export function AnimeTrailer({ media }: { media: Media }) {
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
      className="group relative block aspect-video overflow-hidden border border-border-soft bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
    >
      <ImageWithLoading
        src={thumbnail}
        alt="Trailer thumbnail"
        fill
        sizes="(max-width: 1024px) 100vw, 55vw"
        className="object-cover transition-transform duration-500 group-hover:scale-[1.025] motion-reduce:transform-none"
      />
      <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/35" />
      <div className="absolute bottom-4 left-4 flex items-center gap-3 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-white">
        <span className="flex size-10 items-center justify-center bg-signal text-accent-foreground">
          <PlayIcon className="size-4 fill-current" />
        </span>{" "}
        Watch trailer
      </div>
    </a>
  );
}

export function AnimeTrailerSkeleton() {
  return <div className="shimmer aspect-video w-full border border-border-soft" />;
}
