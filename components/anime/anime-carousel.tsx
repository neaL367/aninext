import type { MediaCard } from "@/lib/anilist/types";
import { AnimeCard } from "@/components/anime/anime-card";
import { cn } from "@/lib/utils";

type AnimeCarouselProps = {
  media: readonly (MediaCard & {
    popularityPercent?: number | null;
    rank?: number;
  })[];
  showCountdown?: boolean;
  className?: string;
};

export function AnimeCarousel({
  media,
  showCountdown = false,
  className,
}: AnimeCarouselProps) {
  return (
    <div
      className={cn(
        "min-w-0 overflow-x-auto overscroll-x-contain pb-1",
        "[scrollbar-width:thin]",
        "snap-x snap-mandatory",
        className
      )}
    >
      <div className="flex w-max gap-3 sm:gap-3.5">
        {media.map((item) => (
          <div
            key={item.id}
            className="w-[9.75rem] shrink-0 snap-start sm:w-[10.5rem] md:w-44"
          >
            <AnimeCard media={item} showCountdown={showCountdown} />
          </div>
        ))}
      </div>
    </div>
  );
}
