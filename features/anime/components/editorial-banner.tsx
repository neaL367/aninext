import { ArrowRightIcon, StarIcon } from "lucide-react";
import Link from "next/link";

import { MediaImage } from "@/components/ui/media-image";
import { AnimePreviewCard } from "@/features/anime/components/anime-preview-card";
import {
  formatFormat,
  getMediaCover,
  getMediaTitle,
  stripHtml,
} from "@/features/anime/lib/media-helpers";

import type { Media } from "@/features/anime/types/anime";
import type { Route } from "next";

export function EditorialBanner({ item }: { item: Media }) {
  if (!item) return null;

  const title = getMediaTitle(item);
  const banner = item.bannerImage ?? getMediaCover(item, "extraLarge");
  const description = stripHtml(item.description);
  const studio = item.studios?.nodes[0]?.name;

  return (
    <section className="relative overflow-hidden border border-border-soft bg-surface-1 py-4">
      <AnimePreviewCard media={item}>
        <Link
          href={`/anime/${item.id}` as Route<string>}
          className="group relative block min-h-[320px] sm:min-h-[380px] w-full overflow-hidden"
        >
          {banner && (
            <MediaImage
              src={banner}
              alt={title}
              fill
              sizes="100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

          <div className="relative z-10 p-8 sm:p-12 max-w-2xl space-y-4 flex flex-col justify-center h-full min-h-[320px] sm:min-h-[380px]">
            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="bg-signal px-2.5 py-0.5 font-bold uppercase tracking-widest text-white">
                Rockstar Masterpiece Break
              </span>
              {item.averageScore && (
                <span className="flex items-center gap-1 font-bold text-foreground">
                  <StarIcon className="size-3.5 fill-signal text-signal" />
                  {(item.averageScore / 10).toFixed(1)} / 10
                </span>
              )}
            </div>

            <h3 className="text-3xl sm:text-5xl font-semibold tracking-[-0.04em] text-foreground leading-none">
              {title}
            </h3>

            <div className="font-mono text-xs text-muted-foreground flex items-center gap-3">
              {item.format && <span>{formatFormat(item.format)}</span>}
              {item.episodes && <span>· {item.episodes} episodes</span>}
              {studio && <span className="text-foreground">· Studio: {studio}</span>}
            </div>

            {description && (
              <p className="line-clamp-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            )}

            <div className="pt-2">
              <span className="inline-flex items-center gap-2 border-b border-signal pb-1 font-mono text-xs uppercase tracking-[0.12em] font-medium text-signal group-hover:text-foreground transition-colors">
                Explore feature detail <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </div>
        </Link>
      </AnimePreviewCard>
    </section>
  );
}
