import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import type { Media } from "@/features/anime/types/anime";
import { scoreColor } from "@/features/anime/lib/score";
import { formatFormat, formatStatus, getMediaTitle } from "@/features/anime/lib/media-helpers";
import { ImageWithLoading } from "@/components/image-with-loading";
import { cn } from "@/lib/utils";

export function AnimePreviewCard({ media, children }: { media: Media; children: React.ReactNode }) {
  const title = getMediaTitle(media);
  const color = media.coverImage.color;
  const studio = media.studios?.nodes[0]?.name;
  const description = media.description?.replace(/<[^>]*>/g, "").trim();

  return (
    <HoverCard>
      <HoverCardTrigger>{children}</HoverCardTrigger>
      <HoverCardContent
        side="right"
        align="start"
        className="w-[min(22rem,calc(100vw-2rem))] overflow-hidden border border-border bg-card p-0 rounded-none"
      >
        {media.bannerImage ? (
          <div className="relative h-24 w-full overflow-hidden">
            <ImageWithLoading src={media.bannerImage} alt="" fill sizes="352px" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
          </div>
        ) : color ? (
          <div className="h-1 w-full" style={{ backgroundColor: color }} />
        ) : null}
        <div className="space-y-3 p-4">
          <h3 className="line-clamp-2 text-base font-semibold leading-snug">{title}</h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-sm text-muted-foreground">
            {media.averageScore && <span className={cn("font-semibold", scoreColor(media.averageScore))}>{(media.averageScore / 10).toFixed(1)}</span>}
            {media.format && <span>{formatFormat(media.format)}</span>}
            {media.episodes && <span>{media.episodes} ep</span>}
            {media.status && <span>{formatStatus(media.status)}</span>}
          </div>
          {description && <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{description}</p>}
          <div className="flex flex-wrap gap-1.5">
            {media.genres.slice(0, 4).map((genre) => (
              <span key={genre} className="border border-border px-2 py-1 font-mono text-xs uppercase tracking-[0.04em] text-muted-foreground">{genre}</span>
            ))}
          </div>
          {studio && (
            <p className="border-t border-border pt-3 font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">{studio}</p>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
