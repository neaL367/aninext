import Image from "next/image";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import type { Media } from "@/features/anime/types/anime";
import { scoreColor } from "@/features/anime/lib/score";
import { getMediaTitle, getMediaCover } from "@/features/anime/lib/media-helpers";
import { cn } from "@/lib/utils";

export function AnimePreviewCard({
  media,
  children,
}: {
  media: Media;
  children: React.ReactNode;
}) {
  const title = getMediaTitle(media);
  const cover = getMediaCover(media);

  return (
    <HoverCard>
      <HoverCardTrigger>{children}</HoverCardTrigger>
      <HoverCardContent className="w-80 rounded-xl border-border-soft bg-popover p-4 shadow-lg" side="right" align="start">
        <div className="flex gap-3">
          {cover && (
            <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-lg">
              <Image
                src={cover}
                alt={title}
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <h4 className="line-clamp-2 text-sm font-semibold leading-tight">
              {title}
            </h4>
            <div className="flex items-center gap-2 text-xs">
              {media.averageScore && (
                <span className={cn("font-mono font-bold tabular-nums", scoreColor(media.averageScore))}>
                  {(media.averageScore / 10).toFixed(1)}
                </span>
              )}
              {media.format && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">
                  {media.format}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {media.genres.slice(0, 3).map((genre) => (
                <span key={genre} className="rounded-full border border-border-soft px-2 py-0.5 text-[10px] text-muted-foreground">
                  {genre}
                </span>
              ))}
            </div>
            {media.episodes && (
              <p className="font-mono text-xs text-muted-foreground tabular-nums">
                {media.episodes} episodes
              </p>
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
