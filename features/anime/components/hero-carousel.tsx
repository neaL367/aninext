"use client";

import { ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayIcon } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { HeroInfo } from "./hero-info";

import type { Media } from "@/features/anime/types/anime";

const AUTOPLAY_INTERVAL = 7000;
const SWIPE_THRESHOLD = 50;

export function HeroCarousel({ items }: { items: Media[] }) {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0);

  const dragStartX = useRef<number | null>(null);
  const isDragging = useRef(false);
  const progressTimerRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const len = items.length;
  const media = items[current] ?? items[0];

  const goTo = useCallback(
    (index: number) => {
      setPrev(current);
      setCurrent((index + len) % len);
      setProgress(0);
      startTimeRef.current = Date.now();
    },
    [current, len],
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prevSlide = useCallback(() => goTo(current - 1), [current, goTo]);

  // Autoplay and Progress Bar Loop
  useEffect(() => {
    if (len < 2 || !isPlaying || isHovered) {
      if (progressTimerRef.current) cancelAnimationFrame(progressTimerRef.current);
      return;
    }

    startTimeRef.current = Date.now() - (progress / 100) * AUTOPLAY_INTERVAL;

    const updateProgress = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min((elapsed / AUTOPLAY_INTERVAL) * 100, 100);
      setProgress(pct);

      if (elapsed >= AUTOPLAY_INTERVAL) {
        next();
      } else {
        progressTimerRef.current = requestAnimationFrame(updateProgress);
      }
    };

    progressTimerRef.current = requestAnimationFrame(updateProgress);

    return () => {
      if (progressTimerRef.current) cancelAnimationFrame(progressTimerRef.current);
    };
  }, [current, isPlaying, isHovered, len, next, progress]);

  // Keyboard navigation (Left/Right arrows, Space bar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.key === " ") {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [next, prevSlide]);

  // Touch and Drag Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (dragStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - dragStartX.current;
    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0) prevSlide();
      else next();
    }
    dragStartX.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    dragStartX.current = e.clientX;
    isDragging.current = true;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging.current || dragStartX.current === null) return;
    const diff = e.clientX - dragStartX.current;
    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0) prevSlide();
      else next();
    }
    dragStartX.current = null;
    isDragging.current = false;
  };

  return (
    <section
      aria-label="Featured anime hero carousel"
      className="relative w-full h-[calc(100vh-64px)] min-h-[640px] max-h-[1080px] overflow-hidden bg-background select-none cursor-grab active:cursor-grabbing"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        isDragging.current = false;
        dragStartX.current = null;
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {/* Full-Bleed Media Layer with GPU Scale Interpolation */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {items.map((item, i) => {
          const image = item.bannerImage ?? item.coverImage.extraLarge;
          const color = item.coverImage.color;
          const isCurrent = i === current;
          const isPrev = i === prev;
          const isAdjacent =
            i === (current + 1) % len || i === (current - 1 + len) % len;
          const isMounted = isCurrent || isPrev || isAdjacent;

          if (!isMounted) return null;

          return (
            <div
              key={item.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                isCurrent ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
              style={{ backgroundColor: color ?? "var(--surface-1)" }}
            >
              {image && (
                <div className={`relative w-full h-full ${isCurrent ? "animate-cinematic-scale" : ""}`}>
                  <Image
                    src={image}
                    alt=""
                    fill
                    priority={i === 0 || isCurrent}
                    sizes="100vw"
                    className="object-cover object-center"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Multi-Layer Cinematic Gradient Overlay for Maximum Legibility */}
      <div className="pointer-events-none absolute inset-0 z-15 bg-gradient-to-t from-background via-background/60 to-transparent" />
      <div className="pointer-events-none absolute inset-0 z-15 bg-gradient-to-b from-background/70 via-transparent to-transparent" />
      <div className="pointer-events-none absolute inset-0 z-15 bg-gradient-to-r from-background/80 via-background/30 to-transparent" />

      {/* Glassmorphic Side Navigation Arrows */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          prevSlide();
        }}
        className="group absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 flex size-12 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/80 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-white/40 hover:bg-black/60 hover:text-white active:scale-95 shadow-xl"
        aria-label="Previous slide"
      >
        <ChevronLeftIcon className="size-6 transition-transform group-hover:-translate-x-0.5" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          next();
        }}
        className="group absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 flex size-12 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/80 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-white/40 hover:bg-black/60 hover:text-white active:scale-95 shadow-xl"
        aria-label="Next slide"
      >
        <ChevronRightIcon className="size-6 transition-transform group-hover:translate-x-0.5" />
      </button>

      {/* Foreground Content Positioned Bottom-Left Aligned with Main Width Layout */}
      <div className="absolute inset-x-0 bottom-0 z-20 pb-16 sm:pb-20 lg:pb-24">
        <div className="mx-auto w-full max-w-[1680px] px-4 sm:px-7 lg:px-10">
          <HeroInfo key={media.id} media={media} rank={current + 1} />
        </div>
      </div>

      {/* Cinematic Animated Progress Bar & Indicator Controls */}
      <div className="absolute bottom-6 sm:bottom-8 inset-x-0 z-30">
        <div className="mx-auto w-full max-w-[1680px] px-4 sm:px-7 lg:px-10 flex items-center justify-between gap-6">
          {/* Animated Expanding Slide Progress Pills */}
          <div className="flex items-center gap-2">
            {items.map((item, index) => {
              const isActive = index === current;
              return (
                <button
                  key={item.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    goTo(index);
                  }}
                  className={`group relative h-2 rounded-full overflow-hidden transition-all duration-500 ${
                    isActive ? "w-16 bg-white/30" : "w-4 bg-white/20 hover:bg-white/40"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                >
                  {isActive && (
                    <div
                      className="absolute inset-y-0 left-0 bg-accent rounded-full transition-all duration-75"
                      style={{ width: `${progress}%` }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Controls: Play/Pause Toggle & Counter */}
          <div className="flex items-center gap-4 text-white/80 font-mono text-xs tracking-widest">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPlaying((p) => !p);
              }}
              className="flex size-8 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-md hover:bg-white/20 hover:text-white transition-colors"
              aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
            >
              {isPlaying ? <PauseIcon className="size-3.5" /> : <PlayIcon className="size-3.5 fill-current" />}
            </button>
            <span className="tabular-nums">
              {String(current + 1).padStart(2, "0")} / {String(len).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HeroCarouselSkeleton() {
  return (
    <div className="relative w-full h-[calc(100vh-64px)] min-h-[640px] max-h-[1080px] overflow-hidden bg-background">
      <div className="absolute inset-0 w-full h-full shimmer" />
      <div className="absolute inset-x-0 bottom-0 z-20 pb-16 sm:pb-20 lg:pb-24">
        <div className="mx-auto w-full max-w-[1680px] px-4 sm:px-7 lg:px-10">
          <div className="space-y-4 max-w-2xl">
            <div className="shimmer h-4 w-28 rounded-full" />
            <div className="shimmer h-16 w-3/4 rounded-lg" />
            <div className="shimmer h-5 w-1/2 rounded" />
            <div className="shimmer h-16 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

