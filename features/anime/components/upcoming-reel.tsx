import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

import { HoverPrefetchLink } from "@/components/ui/hover-prefetch-link";
import { MediaImage } from "@/components/ui/media-image";
import { AnimePreviewCard } from "@/features/anime/components/anime-preview-card";
import {
  formatFormat,
  getMediaCover,
  getMediaTitle,
} from "@/features/anime/lib/media-helpers";
import { SectionHeader } from "./section-header";

import type { Media } from "@/features/anime/types/anime";
import type { Route } from "next";

export function UpcomingReel({
  title,
  href,
  items,
  description,
}: {
  title: string;
  href: Route<string>;
  items: Media[];
  description?: string;
}) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-6">
      <SectionHeader
        eyebrow="Netflix Radar"
        title={title}
        description={description ?? "Not yet released, already on the radar."}
        action={
          <HoverPrefetchLink
            href={href}
            className="group flex items-center gap-2 border-b border-border-soft pb-1 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground hover:border-signal hover:text-signal"
          >
            View upcoming reel{" "}
            <ArrowRightIcon className="size-3 transition-transform group-hover:translate-x-1" />
          </HoverPrefetchLink>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {items.slice(0, 4).map((item) => {
          const itemTitle = getMediaTitle(item);
          const banner = item.bannerImage ?? getMediaCover(item, "extraLarge");
          const seasonYear = item.seasonYear ? `${item.season ?? ""} ${item.seasonYear}`.trim() : "TBA";
          const studio = item.studios?.nodes[0]?.name;

          return (
            <AnimePreviewCard key={item.id} media={item}>
              <Link
                href={`/anime/${item.id}` as Route<string>}
                className="group relative block overflow-hidden border border-border-soft bg-surface-1 transition-all duration-300 hover:-translate-y-1 hover:border-signal/50 aspect-[16/10]"
              >
                {banner && (
                  <MediaImage
                    src={banner}
                    alt={itemTitle}
                    fill
                    sizes="(min-width: 1024px) 22vw, 44vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

                <span className="absolute top-3 left-3 bg-surface-1/90 px-2 py-0.5 font-mono text-[0.62rem] font-bold uppercase tracking-wider text-signal backdrop-blur-md border border-border-soft">
                  {seasonYear}
                </span>

                <div className="absolute bottom-3 inset-x-3 space-y-1">
                  <h4 className="font-semibold text-sm text-foreground line-clamp-1 leading-snug group-hover:text-signal transition-colors">
                    {itemTitle}
                  </h4>
                  <div className="font-mono text-[0.68rem] text-muted-foreground flex items-center justify-between">
                    <span>{item.format ? formatFormat(item.format) : "TV Series"}</span>
                    {studio && <span className="truncate max-w-[110px]">{studio}</span>}
                  </div>
                </div>
              </Link>
            </AnimePreviewCard>
          );
        })}
      </div>
    </section>
  );
}
