import { ArrowUpRightIcon, StarIcon } from "lucide-react";
import Link from "next/link";

import { HoverPrefetchLink } from "@/components/ui/hover-prefetch-link";
import { MediaImage } from "@/components/ui/media-image";
import { AnimePreviewCard } from "@/features/anime/components/anime-preview-card";
import {
  formatFormat,
  getMediaCover,
  getMediaTitle,
  stripHtml,
} from "@/features/anime/lib/media-helpers";

import { MediaCard, MediaCardSkeleton } from "./media-card";
import { SectionHeader } from "./section-header";

import type { Media } from "@/features/anime/types/anime";
import type { Route } from "next";

export function FeatureMosaic({
  title,
  href,
  items,
}: {
  title: string;
  href: Route<string>;
  items: Media[];
}) {
  if (items.length === 0) return null;

  const heroItem = items[0];
  const gridItems = items.slice(1, 5);
  const heroTitle = getMediaTitle(heroItem);
  const heroCover = getMediaCover(heroItem, "extraLarge");
  const heroDescription = stripHtml(heroItem.description);

  return (
    <section>
      <SectionHeader
        eyebrow="PlayStation Showcase"
        title={title}
        action={
          <HoverPrefetchLink
            href={href}
            className="group flex items-center gap-2 border-b border-border-soft pb-1 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground hover:border-signal hover:text-signal"
          >
            View all{" "}
            <ArrowUpRightIcon className="size-3 transition-transform group-hover:translate-x-0.5" />
          </HoverPrefetchLink>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        {/* Asymmetric Large Highlight Poster Card */}
        <div className="md:col-span-6 lg:col-span-5">
          <AnimePreviewCard media={heroItem}>
            <Link
              href={`/anime/${heroItem.id}` as Route<string>}
              className="group relative block h-full min-h-[380px] overflow-hidden border border-border-soft bg-surface-1 transition-colors duration-300 hover:border-signal/60 isolate transform-gpu"
            >
              {heroCover && (
                <MediaImage
                  src={heroCover}
                  alt={heroTitle}
                  fill
                  priority
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03] transform-gpu will-change-transform"
                />
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

              <span className="pointer-events-none absolute top-3 left-3 bg-foreground text-background px-2 py-0.5 font-mono text-[0.65rem] font-bold uppercase tracking-wider">
                Featured Highlight
              </span>

              {heroItem.averageScore && (
                <span className="pointer-events-none absolute top-3 right-3 bg-background/80 px-2 py-0.5 font-mono text-xs font-semibold text-signal backdrop-blur-md border border-border-soft">
                  <StarIcon className="inline size-3 mr-1 fill-signal" />
                  {(heroItem.averageScore / 10).toFixed(1)}
                </span>
              )}

              <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6 space-y-2">
                <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground line-clamp-2 leading-snug">
                  {heroTitle}
                </h3>
                <div className="font-mono text-xs text-muted-foreground">
                  {heroItem.format && <span>{formatFormat(heroItem.format)}</span>}
                  {heroItem.episodes && <span> · {heroItem.episodes} episodes</span>}
                </div>
                {heroDescription && (
                  <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                    {heroDescription}
                  </p>
                )}
              </div>
            </Link>
          </AnimePreviewCard>
        </div>

        {/* Right 4-Grid Cards */}
        <div className="md:col-span-6 lg:col-span-7 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {gridItems.map((item) => (
            <div key={item.id}>
              <AnimePreviewCard media={item}>
                <MediaCard media={item} coverTier="extraLarge" />
              </AnimePreviewCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeatureMosaicSkeleton() {
  return (
    <section>
      <div className="mb-5 space-y-3">
        <div className="shimmer h-2.5 w-24 rounded" />
        <div className="shimmer h-8 w-56 rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        <div className="md:col-span-6 lg:col-span-5">
          <div className="relative block h-full min-h-[380px] overflow-hidden rounded-md border border-border-soft bg-surface-1 isolate">
            <div className="absolute inset-0 shimmer" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6 space-y-2">
              <div className="shimmer h-6 w-3/4 rounded" />
              <div className="shimmer h-3.5 w-1/2 rounded" />
              <div className="shimmer h-4 w-5/6 rounded" />
            </div>
          </div>
        </div>
        <div className="md:col-span-6 lg:col-span-7 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <MediaCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
