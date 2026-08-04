import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import type { Media } from "@/features/anime/types/anime";
import { scoreColor, scoreBg } from "@/features/anime/lib/score";
import { getMediaTitle, getMediaCover } from "@/features/anime/lib/media-helpers";
import { cn } from "@/lib/utils";

export function MediaCard({ media, size = "default" }: { media: Media; size?: "default" | "featured" }) {
  const title = getMediaTitle(media);
  const cover = getMediaCover(media);
  const isReleasing = media.status === "RELEASING";

  return (
    <Link
      href={`/anime/${media.id}` as Route<string>}
      aria-label={`Open ${title}`}
      className={cn(
        "group relative block cursor-pointer rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        size === "featured" ? "col-span-1 sm:col-span-2" : ""
      )}
    >
      <div className="relative overflow-hidden rounded-xl bg-card transition-all duration-300 group-hover:ring-1 group-hover:ring-accent/40 group-hover:shadow-[0_0_20px_var(--glow)] motion-reduce:transition-none motion-reduce:group-hover:shadow-none">
        <div className={cn(
          "relative overflow-hidden",
          size === "featured" ? "aspect-[16/10]" : "aspect-[2/3]"
        )}>
          {cover && (
            <Image
              src={cover}
              alt={`${title} cover`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              sizes={size === "featured" ? "(min-width:1024px) 40vw, 90vw" : "(min-width:1024px) 16vw, 45vw"}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          {media.averageScore && (
            <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 backdrop-blur-sm">
              <span className={cn("size-1.5 rounded-full", scoreBg(media.averageScore))} />
              <span className={cn("font-mono text-xs font-semibold tabular-nums text-white", scoreColor(media.averageScore))}>
                {(media.averageScore / 10).toFixed(1)}
              </span>
            </div>
          )}

          {isReleasing && (
            <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded-md bg-live-badge/90 px-2 py-0.5 backdrop-blur-sm">
              <span className="size-1.5 animate-pulse rounded-full bg-white" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white">
                Airing
              </span>
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 p-3">
            <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-white drop-shadow-sm">
              {title}
            </h3>
            <div className="mt-1 flex items-center gap-1.5 font-mono text-[11px] text-white/70 tabular-nums">
              {media.format && <span>{media.format}</span>}
              {media.format && media.episodes && <span>·</span>}
              {media.episodes && <span>{media.episodes} ep</span>}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function MediaCardSkeleton({ size = "default" }: { size?: "default" | "featured" }) {
  return (
    <div className={cn(
      "overflow-hidden rounded-xl bg-card",
      size === "featured" ? "col-span-1 sm:col-span-2" : ""
    )}>
      <div className={cn(
        "relative overflow-hidden",
        size === "featured" ? "aspect-[16/10]" : "aspect-[2/3]"
      )}>
        <div className="shimmer absolute inset-0" />
      </div>
    </div>
  );
}
