import Link from "next/link";

import { MediaImage } from "@/components/ui/media-image";
import { ViewAllLink } from "@/components/ui/view-all-link";
import { AnimePreviewCard } from "@/features/anime/components/anime-preview-card";
import { ScoreBadge } from "@/features/anime/components/score-badge";
import {
  formatFormat,
  getMediaCover,
  getMediaTitle,
  stripHtml,
} from "@/features/anime/lib/media-helpers";

import { SectionHeader } from "./section-header";

import type { Media } from "@/features/anime/types/anime";
import type { Route } from "next";

export function TrendingShowcase({ items }: { items: Media[] }) {
  "use memo";
  if (items.length === 0) return null;

  const heroItem = items[0];
  const sideItems = items.slice(1, 7);

  const heroTitle = getMediaTitle(heroItem);
  const heroCover = getMediaCover(heroItem, "extraLarge") ?? heroItem.bannerImage;
  const heroDescription = stripHtml(heroItem.description);
  const heroStudio = heroItem.studios?.nodes[0]?.name;

  return (
    <section className="space-y-6">
      <SectionHeader
        eyebrow="Apple TV Spotlight"
        title="Trending Now"
        description="The most watched and talked-about titles this week."
        action={<ViewAllLink href="/anime/trending">View all trending</ViewAllLink>}
      />

      {/* Featured #1 Spotlight Hero Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7">
          <AnimePreviewCard media={heroItem}>
            <Link
              href={`/anime/${heroItem.id}` as Route<string>}
              className="group relative block h-full min-h-[380px] sm:min-h-[440px] overflow-hidden border border-border-soft bg-surface-1 transition-all duration-300 hover:border-signal/60 isolate transform-gpu"
            >
              {heroCover && (
                <MediaImage
                  src={heroCover}
                  alt={heroTitle}
                  fill
                  priority
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03] transform-gpu will-change-transform"
                />
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

              <div className="pointer-events-none absolute inset-0 p-6 sm:p-8 flex flex-col justify-end space-y-3 z-10">
                <div className="flex items-center gap-2 font-mono text-xs pointer-events-auto">
                  <span className="bg-foreground text-background px-2 py-0.5 font-bold uppercase tracking-wider">
                    #01 Trending
                  </span>
                  {heroItem.status === "RELEASING" && (
                    <span className="bg-destructive/15 border border-destructive/30 px-2 py-0.5 font-semibold text-destructive uppercase tracking-wider text-[0.65rem]">
                      Airing Now
                    </span>
                  )}
                </div>

                <h3 className="text-2xl sm:text-4xl font-semibold tracking-[-0.04em] text-foreground line-clamp-2 leading-tight pointer-events-auto">
                  {heroTitle}
                </h3>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground pointer-events-auto">
                  {heroItem.averageScore && <ScoreBadge score={heroItem.averageScore} />}
                  {heroItem.format && <span>{formatFormat(heroItem.format)}</span>}
                  {heroItem.episodes && <span>{heroItem.episodes} episodes</span>}
                  {heroStudio && <span className="text-foreground">{heroStudio}</span>}
                </div>

                {heroDescription && (
                  <p className="line-clamp-2 text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl pointer-events-auto">
                    {heroDescription}
                  </p>
                )}
              </div>
            </Link>
          </AnimePreviewCard>
        </div>

        {/* 16:9 Landscape Reel Grid (#2 - #7) */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
          {sideItems.map((item, idx) => {
            const title = getMediaTitle(item);
            const image = item.bannerImage ?? item.coverImage.extraLarge;
            return (
              <AnimePreviewCard key={item.id} media={item}>
                <Link
                  href={`/anime/${item.id}` as Route<string>}
                  className="group relative block overflow-hidden border border-border-soft bg-surface-1 transition-colors duration-300 hover:border-signal/60 aspect-[16/9] isolate transform-gpu"
                >
                  {image && (
                    <MediaImage
                      src={image}
                      alt={title}
                      fill
                      sizes="(min-width: 1024px) 18vw, 44vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105 transform-gpu will-change-transform"
                    />
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                  <span className="pointer-events-none absolute top-2 left-2 bg-background/80 px-1.5 py-0.5 font-mono text-[0.65rem] font-bold text-foreground backdrop-blur-md border border-border-soft">
                    #{String(idx + 2).padStart(2, "0")}
                  </span>

                  {item.averageScore && (
                    <span className="pointer-events-none absolute top-2 right-2 bg-background/80 px-1.5 py-0.5 font-mono text-[0.65rem] font-bold text-signal backdrop-blur-md border border-border-soft">
                      {(item.averageScore / 10).toFixed(1)}
                    </span>
                  )}

                  <div className="pointer-events-none absolute bottom-2 inset-x-2">
                    <p className="line-clamp-1 font-semibold text-xs text-white leading-tight">
                      {title}
                    </p>
                  </div>
                </Link>
              </AnimePreviewCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
