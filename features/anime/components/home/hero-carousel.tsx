"use client";

import { useEffect, useState, useRef } from "react";

import { ImageWithLoading } from "@/components/image-with-loading";

import { HeroInfo } from "./hero-content";

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
    <section aria-label="Featured anime" className="relative bg-surface-1 lg:min-h-[660px]">
      <div className="relative h-[300px] overflow-hidden lg:absolute lg:inset-y-0 lg:right-0 lg:h-full lg:w-[55%]">
        {items.map((item, i) => {
          const image = item.bannerImage ?? item.coverImage.extraLarge;
          const color = item.coverImage.color;
          const isCurrent = i === current;
          const isPrev = i === prev;
          return (
            <div
              key={item.id}
              className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
              style={{ opacity: isCurrent ? 1 : isPrev ? 0 : 0 }}
            >
              {image ? (
                <ImageWithLoading
                  src={image}
                  alt=""
                  fill
                  priority={i === 0}
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{
                    background: color
                      ? `linear-gradient(135deg, ${color}80, var(--surface-2))`
                      : "linear-gradient(135deg, var(--signal-strong), var(--surface-2))",
                  }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-surface-1 via-transparent to-transparent" />
            </div>
          );
        })}
        <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-surface-1/90 via-surface-1/50 to-transparent lg:block" />
        <div className="absolute bottom-4 right-4 z-10 font-mono text-xs tabular-nums tracking-[0.1em] text-white/60">
          {String(current + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1680px] items-center px-4 sm:px-7 lg:min-h-[660px] lg:px-10">
        <div className="py-8 sm:py-10 lg:max-w-[45%]">
          <HeroInfo key={media.id} media={media} />
          <div className="mt-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground">
            <span className="h-px w-8 bg-accent" /> Powered by AniList
          </div>
        </div>
      </div>
    </section>
  );
}

export function HeroCarouselSkeleton() {
  return (
    <div className="bg-surface-1">
      <div className="h-[300px] shimmer lg:absolute lg:inset-y-0 lg:right-0 lg:h-full lg:w-[55%]" />
      <div className="mx-auto flex w-full max-w-[1680px] items-center px-4 sm:px-7 lg:min-h-[660px] lg:px-10">
        <div className="py-8 sm:py-10 lg:max-w-[45%]">
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
