"use client";

import { PauseIcon, PlayIcon } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { HeroInfo } from "./hero-info";
import { usePrefersReducedMotion } from "../hooks/use-reduced-motion";

import type { Media } from "@/features/anime/types/anime";

const AUTOPLAY_INTERVAL = 9000;
const SWIPE_THRESHOLD = 56;

export function HeroCarousel({ items }: { items: Media[] }) {
  "use memo";
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const reducedMotion = usePrefersReducedMotion();

  const dragStartX = useRef<number | null>(null);
  const isDragging = useRef(false);
  const len = items.length;
  const media = items[current] ?? items[0];

  const goTo = useCallback(
    (index: number) => {
      setPrev(current);
      setCurrent((index + len) % len);
      setProgress(0);
    },
    [current, len],
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prevSlide = useCallback(() => goTo(current - 1), [current, goTo]);

  // Autoplay is a progressive enhancement: off for reduced-motion visitors.
  useEffect(() => {
    if (len < 2 || !isPlaying || reducedMotion) return;

    const startTime = Date.now();
    const intervalId = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / AUTOPLAY_INTERVAL) * 100, 100);
      setProgress(pct);
      if (elapsed >= AUTOPLAY_INTERVAL) next();
    }, 100);

    return () => clearInterval(intervalId);
  }, [current, isPlaying, len, next, reducedMotion]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      prevSlide();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      next();
    }
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    dragStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (dragStartX.current === null) return;
    const diff = event.changedTouches[0].clientX - dragStartX.current;
    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0) prevSlide();
      else next();
    }
    dragStartX.current = null;
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    dragStartX.current = event.clientX;
    isDragging.current = true;
  };

  const handleMouseUp = (event: React.MouseEvent) => {
    if (!isDragging.current || dragStartX.current === null) return;
    const diff = event.clientX - dragStartX.current;
    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0) prevSlide();
      else next();
    }
    dragStartX.current = null;
    isDragging.current = false;
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured anime"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseLeave={() => {
        isDragging.current = false;
        dragStartX.current = null;
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className="relative h-[76vh] min-h-[520px] max-h-[780px] w-full cursor-grab select-none overflow-hidden bg-background focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-signal active:cursor-grabbing"
    >
      <div className="pointer-events-none absolute inset-0">
        {items.map((item, i) => {
          const image = item.bannerImage ?? item.coverImage.extraLarge;
          const isCurrent = i === current;
          const isPrev = i === prev;
          const isAdjacent = i === (current + 1) % len || i === (current - 1 + len) % len;
          if (!(isCurrent || isPrev || isAdjacent)) return null;

          return (
            <div
              key={item.id}
              className="absolute inset-0 transition-opacity duration-[1400ms] ease-out"
              style={{ opacity: isCurrent ? 1 : 0 }}
            >
              {image && (
                <div
                  className={`relative h-full w-full ${
                    isCurrent && !reducedMotion ? "animate-cinematic-scale" : ""
                  }`}
                >
                  <Image
                    src={image}
                    alt=""
                    fill
                    priority={i === 0 || isCurrent}
                    sizes="100vw"
                    unoptimized
                    className="object-cover object-[50%_28%]"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/55 to-background/5" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background/75 via-transparent to-transparent" />

      <div className="absolute inset-x-0 bottom-0 z-20 pb-16 sm:pb-20 lg:pb-24">
        <div className="mx-auto w-full max-w-[1760px] px-4 sm:px-7 lg:px-10">
          <HeroInfo key={media.id} media={media} />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-5 z-30 sm:bottom-7">
        <div className="mx-auto flex w-full max-w-[1760px] items-center gap-5 px-4 sm:px-7 lg:px-10">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPlaying((value) => !value)}
              className="flex size-8 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-white/50 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
              aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
              aria-pressed={isPlaying}
            >
              {isPlaying ? (
                <PauseIcon className="size-3 fill-current" />
              ) : (
                <PlayIcon className="ml-0.5 size-3 fill-current" />
              )}
            </button>
            <span className="font-mono text-[0.62rem] tabular-nums tracking-[0.12em] text-white/60">
              {String(current + 1).padStart(2, "0")} / {String(len).padStart(2, "0")}
            </span>
          </div>

          <div className="flex flex-1 items-center gap-1.5">
            {items.map((item, index) => {
              const isActive = index === current;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={isActive ? "true" : undefined}
                  className="group relative h-4 flex-1 max-w-24 cursor-pointer"
                >
                  <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/25 transition-colors group-hover:bg-white/60" />
                  {isActive && (
                    <span
                      className="absolute left-0 top-1/2 h-px -translate-y-1/2 bg-signal"
                      style={{ width: reducedMotion ? "100%" : `${progress}%` }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export function HeroCarouselSkeleton() {
  return (
    <div className="relative h-[76vh] min-h-[520px] max-h-[780px] w-full overflow-hidden bg-background">
      <div className="absolute inset-0 shimmer" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 z-20 pb-16 sm:pb-20 lg:pb-24">
        <div className="mx-auto w-full max-w-[1760px] px-4 sm:px-7 lg:px-10">
          <div className="max-w-2xl space-y-4">
            <div className="shimmer h-3 w-20 rounded-[2px]" />
            <div className="shimmer h-14 w-4/5 rounded-[2px] sm:h-20" />
            <div className="shimmer h-4 w-1/2 rounded-[2px]" />
            <div className="shimmer h-12 w-full max-w-xl rounded-[2px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
