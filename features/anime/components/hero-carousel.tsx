"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { HeroInfo } from "./hero-info";

import type { Media } from "@/features/anime/types/anime";

export function HeroCarousel({ items }: { items: Media[] }) {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(-1);
  const currentRef = useRef(current);
  const media = items[current] ?? items[0];

  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  useEffect(() => {
    if (items.length < 2) return;
    let timer: ReturnType<typeof setInterval>;

    const tick = () => {
      setPrev(currentRef.current);
      setCurrent((c) => (c + 1) % items.length);
    };

    const start = () => {
      clearInterval(timer);
      timer = setInterval(tick, 7000);
    };

    const stop = () => clearInterval(timer);

    const onVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        tick();
        start();
      }
    };

    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [items.length]);

  return (
    <section aria-label="Featured anime" className="relative w-full overflow-hidden bg-surface-1 min-h-[480px] sm:min-h-[560px] lg:min-h-[660px]">
      {/* Full width banner container without gradient overlays */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {items.map((item, i) => {
          const image = item.bannerImage ?? item.coverImage.extraLarge;
          const color = item.coverImage.color;
          const isCurrent = i === current;
          const isPrev = i === prev;
          const isMounted = isCurrent || isPrev || i === 0;
          return (
            <div
              key={item.id}
              className="absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out"
              style={{
                opacity: isCurrent ? 1 : isPrev ? 0 : 0,
                ...(color ? { backgroundColor: color } : {}),
              }}
            >
              {image && isMounted ? (
                <Image
                  src={image}
                  alt=""
                  fill
                  priority={i === 0}
                  sizes="100vw"
                  className="object-cover"
                />
              ) : (
                <div
                  className="absolute inset-0 w-full h-full"
                  style={{
                    background: color
                      ? `linear-gradient(135deg, ${color}80, var(--surface-2))`
                      : "linear-gradient(135deg, var(--signal-strong), var(--surface-2))",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Main width layout aligned content with slide up animation on autoplay */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1680px] min-h-[480px] sm:min-h-[560px] lg:min-h-[660px] items-center px-4 sm:px-7 lg:px-10">
        <div
          key={media.id}
          className="hero-slide-up my-8 max-w-xl lg:max-w-2xl rounded-2xl border border-white/10 bg-background/80 p-6 sm:p-8 backdrop-blur-md shadow-2xl"
        >
          <HeroInfo media={media} />
          <div className="mt-6 flex items-center justify-between font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground border-t border-border-soft/60 pt-4">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-accent" /> Powered by AniList
            </div>
            <div className="tabular-nums tracking-[0.1em] text-foreground font-semibold">
              {String(current + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HeroCarouselSkeleton() {
  return (
    <div className="relative w-full overflow-hidden bg-surface-1 min-h-[480px] sm:min-h-[560px] lg:min-h-[660px]">
      <div className="absolute inset-0 w-full h-full shimmer" />
      <div className="relative z-10 mx-auto flex w-full max-w-[1680px] min-h-[480px] sm:min-h-[560px] lg:min-h-[660px] items-center px-4 sm:px-7 lg:px-10">
        <div className="my-8 w-full max-w-xl lg:max-w-2xl rounded-2xl border border-border-soft bg-background/80 p-6 sm:p-8">
          <div className="space-y-4">
            <div className="shimmer h-3 w-24 rounded" />
            <div className="shimmer h-3 w-20 rounded" />
            <div className="shimmer h-12 w-3/4 rounded" />
            <div className="shimmer h-4 w-2/3 rounded" />
            <div className="shimmer h-16 w-full rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
