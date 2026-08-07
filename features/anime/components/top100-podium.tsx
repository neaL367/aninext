import { ArrowRightIcon, StarIcon } from "lucide-react";
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

export function Top100Podium({
  title,
  href,
  items,
}: {
  title: string;
  href: Route<string>;
  items: Media[];
}) {
  if (items.length === 0) return null;

  const topThree = items.slice(0, 3);
  const remaining = items.slice(3, 11);

  const podiumColors = [
    { border: "border-amber-400/60", badge: "bg-amber-400 text-black", label: "#01" },
    { border: "border-slate-300/60", badge: "bg-slate-300 text-black", label: "#02" },
    { border: "border-amber-700/60", badge: "bg-amber-700 text-white", label: "#03" },
  ];

  return (
    <section className="space-y-8">
      <SectionHeader
        eyebrow="Game Awards Hall of Fame"
        title={title}
        description="The top-ranked masterpieces evaluated by enduring staying power."
        action={
          <HoverPrefetchLink
            href={href}
            className="group flex items-center gap-2 border-b border-border-soft pb-1 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground hover:border-signal hover:text-signal"
          >
            View all Top 100{" "}
            <ArrowRightIcon className="size-3 transition-transform group-hover:translate-x-1" />
          </HoverPrefetchLink>
        }
      />

      {/* Top 3 Podium Showcase */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
        {topThree.map((item, idx) => {
          const itemTitle = getMediaTitle(item);
          const cover = getMediaCover(item, "extraLarge");
          const config = podiumColors[idx] ?? podiumColors[0];

          return (
            <AnimePreviewCard key={item.id} media={item}>
              <Link
                href={`/anime/${item.id}` as Route<string>}
                className={`group relative block overflow-hidden border bg-surface-1 transition-colors duration-300 hover:border-signal/60 isolate transform-gpu ${config.border} ${
                  idx === 0 ? "min-h-[380px] sm:min-h-[420px]" : "min-h-[320px] sm:min-h-[360px]"
                }`}
              >
                {cover && (
                  <MediaImage
                    src={cover}
                    alt={itemTitle}
                    fill
                    sizes="(min-width: 640px) 30vw, 90vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105 transform-gpu will-change-transform"
                  />
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

                <span className={`pointer-events-none absolute top-3 left-3 px-2.5 py-0.5 font-mono text-xs font-bold ${config.badge}`}>
                  {config.label}
                </span>

                {item.averageScore && (
                  <span className="pointer-events-none absolute top-3 right-3 bg-black/70 px-2 py-0.5 font-mono text-xs font-semibold text-signal backdrop-blur-md border border-white/10">
                    <StarIcon className="inline size-3 mr-1 fill-signal" />
                    {(item.averageScore / 10).toFixed(1)}
                  </span>
                )}

                <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 space-y-1">
                  <h3 className="text-base sm:text-lg font-semibold tracking-tight text-foreground line-clamp-2 leading-tight">
                    {itemTitle}
                  </h3>
                  <div className="font-mono text-xs text-muted-foreground flex items-center gap-2">
                    {item.format && <span>{formatFormat(item.format)}</span>}
                    {item.episodes && <span>· {item.episodes} ep</span>}
                  </div>
                </div>
              </Link>
            </AnimePreviewCard>
          );
        })}
      </div>

      {/* Ranks #4 to #11 Horizontal List View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {remaining.map((item, index) => {
          const itemTitle = getMediaTitle(item);
          const cover = getMediaCover(item, "large");
          const rankNum = index + 4;

          return (
            <AnimePreviewCard key={item.id} media={item}>
              <Link
                href={`/anime/${item.id}` as Route<string>}
                className="group flex items-center gap-4 border border-border-soft bg-surface-1 p-3 transition-all duration-300 hover:border-signal/50 hover:bg-surface-2"
              >
                <span className="font-mono text-lg font-bold text-muted-foreground w-8 text-center shrink-0">
                  #{String(rankNum).padStart(2, "0")}
                </span>

                <div className="relative size-14 shrink-0 overflow-hidden border border-border-soft bg-surface-2">
                  {cover && (
                    <MediaImage
                      src={cover}
                      alt={itemTitle}
                      fill
                      sizes="56px"
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <h4 className="font-semibold text-sm text-foreground truncate group-hover:text-signal transition-colors">
                    {itemTitle}
                  </h4>
                  <div className="font-mono text-xs text-muted-foreground flex items-center gap-3">
                    {item.averageScore && (
                      <span className="text-foreground font-semibold flex items-center gap-1">
                        <StarIcon className="size-3 fill-signal text-signal" />
                        {(item.averageScore / 10).toFixed(1)}
                      </span>
                    )}
                    {item.format && <span>{formatFormat(item.format)}</span>}
                    {item.episodes && <span>{item.episodes} ep</span>}
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
