import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import type { Media } from "@/features/anime/types/anime";
import { scoreColor } from "@/features/anime/lib/score";
import { formatFormat, formatStatus, getMediaTitle } from "@/features/anime/lib/media-helpers";
import { ImageWithLoading } from "@/components/image-with-loading";
import { cn } from "@/lib/utils";
import { CalendarIcon, FilmIcon, PlayIcon, TvIcon } from "lucide-react";

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
        sideOffset={8}
        className="w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-none border border-neutral-200 bg-white p-0 text-neutral-900 shadow-xl"
      >
        {media.bannerImage ? (
          <div className="relative h-28 w-full overflow-hidden">
            <ImageWithLoading src={media.bannerImage} alt="" fill sizes="352px" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent" />
            {media.averageScore && (
              <div className="absolute right-3 top-3 flex items-center gap-1 rounded-sm bg-black/70 px-2 py-1 backdrop-blur-sm">
                <span className={cn("font-mono text-xs font-bold tabular-nums", scoreColor(media.averageScore))}>
                  ★ {(media.averageScore / 10).toFixed(1)}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="relative h-16 w-full" style={color ? { background: `linear-gradient(135deg, ${color}40, #ffffff)` } : undefined}>
            {media.averageScore && (
              <div className="absolute right-3 top-3 flex items-center gap-1 rounded-sm bg-black/70 px-2 py-1 backdrop-blur-sm">
                <span className={cn("font-mono text-xs font-bold tabular-nums", scoreColor(media.averageScore))}>
                  ★ {(media.averageScore / 10).toFixed(1)}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3 p-4">
          <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight">{title}</h3>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
            {media.format && (
              <span className="inline-flex items-center gap-1 rounded-sm border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-wide text-neutral-600">
                <TvIcon className="size-3" />
                {formatFormat(media.format)}
              </span>
            )}
            {media.episodes && (
              <span className="inline-flex items-center gap-1 rounded-sm border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-wide text-neutral-600">
                <FilmIcon className="size-3" />
                {media.episodes} ep
              </span>
            )}
            {media.status && (
              <span className={cn(
                "inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-wide",
                media.status === "RELEASING"
                  ? "border-green-300 bg-green-50 text-green-700"
                  : "border-neutral-200 bg-neutral-100 text-neutral-600"
              )}>
                <PlayIcon className="size-3" />
                {formatStatus(media.status)}
              </span>
            )}
            {media.seasonYear && (
              <span className="inline-flex items-center gap-1 rounded-sm border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-wide text-neutral-600">
                <CalendarIcon className="size-3" />
                {media.season} {media.seasonYear}
              </span>
            )}
          </div>

          {description && (
            <p className="line-clamp-3 text-sm leading-relaxed text-neutral-600">{description}</p>
          )}

          {media.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {media.genres.slice(0, 4).map((genre) => (
                <span key={genre} className="rounded-sm border border-neutral-200 bg-neutral-50 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider text-neutral-500">
                  {genre}
                </span>
              ))}
            </div>
          )}

          {studio && (
            <div className="border-t border-neutral-200 pt-3">
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.08em] text-neutral-500">
                Studio <span className="text-neutral-900">{studio}</span>
              </p>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
