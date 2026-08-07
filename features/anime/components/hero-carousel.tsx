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
    <section aria-label="Featured anime" className="relative w-full h-[480px] sm:h-[560px] lg:h-[620px] overflow-hidden bg-surface-1">
      {/* Full-width Banner Images (No Gradient Overlay) */}
      <div className="absolute inset-0 w-full h-full">
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
              {image && isMounted && (
                <Image
                  src={image}
                  alt=""
                  fill
                  priority={i === 0}
                  sizes="100vw"
                  className="object-cover"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Content Positioned Absolute Bottom-Left Aligned with Main Width Layout */}
      <div className="absolute inset-x-0 bottom-0 z-20 pb-8 sm:pb-12 lg:pb-14">
        <div className="mx-auto w-full max-w-[1680px] px-4 sm:px-7 lg:px-10">
          <HeroInfo key={media.id} media={media} />
        </div>
      </div>

      {/* Slide Counter */}
      <div className="absolute bottom-8 right-4 sm:right-7 lg:right-10 z-20 font-mono text-xs tabular-nums tracking-[0.1em] text-white/70">
        {String(current + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
      </div>
    </section>
  );
}

export function HeroCarouselSkeleton() {
  return (
    <div className="relative w-full h-[480px] sm:h-[560px] lg:h-[620px] overflow-hidden bg-surface-1">
      <div className="absolute inset-0 w-full h-full shimmer" />
      <div className="absolute inset-x-0 bottom-0 z-20 pb-8 sm:pb-12 lg:pb-14">
        <div className="mx-auto w-full max-w-[1680px] px-4 sm:px-7 lg:px-10">
          <div className="space-y-4 max-w-2xl">
            <div className="shimmer h-3 w-24 rounded" />
            <div className="shimmer h-12 w-3/4 rounded" />
            <div className="shimmer h-4 w-1/2 rounded" />
            <div className="shimmer h-12 w-full rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
