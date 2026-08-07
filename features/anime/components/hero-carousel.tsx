"use client";

import { PauseIcon, PlayIcon } from "lucide-react";
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

    const startTime = Date.now();
    let animationFrameId: number;

    const loop = () => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / AUTOPLAY_INTERVAL) * 100, 100);
      setProgress(pct);

      if (elapsed >= AUTOPLAY_INTERVAL) {
        next();
      } else {
        animationFrameId = requestAnimationFrame(loop);
      }
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [current, isPlaying, isHovered, len, next]);

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
      className="relative w-full h-[500px] sm:h-[580px] lg:h-[640px] overflow-hidden bg-background select-none cursor-grab active:cursor-grabbing"
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
      <div className="absolute inset-0 w-full h-full pointer-events-none bg-background">
        {items.map((item, i) => {
          const image = item.bannerImage ?? item.coverImage.extraLarge;
          const isCurrent = i === current;
          const isPrev = i === prev;
          const isAdjacent =
            i === (current + 1) % len || i === (current - 1 + len) % len;
          const isMounted = isCurrent || isPrev || isAdjacent;

          if (!isMounted) return null;

          return (
            <div
              key={item.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out bg-background ${
                isCurrent ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              {image && (
                <div className={`relative w-full h-full ${isCurrent ? "animate-cinematic-scale" : ""}`}>
                  <Image
                    src={image}
                    alt=""
                    fill
                    priority={i === 0 || isCurrent}
                    sizes="100vw"
                    unoptimized
                    className="object-cover object-center transform-gpu"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Seamless Bottom Gradient Overlay matching Page Background */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-4/5 z-15 bg-gradient-to-t from-background via-background/70 via-50% to-transparent" />

      {/* Foreground Content Positioned Bottom-Left Aligned with Main Width Layout */}
      <div className="absolute inset-x-0 bottom-0 z-20 pb-14 sm:pb-16 lg:pb-18">
        <div className="mx-auto w-full max-w-[1680px] px-4 sm:px-7 lg:px-10">
          <HeroInfo key={media.id} media={media} rank={current + 1} />
        </div>
      </div>

      {/* Unified Glassmorphic Controls Capsule */}
      <div className="absolute bottom-5 sm:bottom-7 right-4 sm:right-7 lg:right-10 z-30">
        <div className="flex items-center gap-3 rounded-full border border-border-soft bg-background/90 p-2 backdrop-blur-xl shadow-2xl isolate">
          {/* Play / Pause Toggle Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsPlaying((p) => !p);
            }}
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-signal text-white hover:bg-signal-strong transition-all hover:scale-105 active:scale-95 shadow-md"
            aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
          >
            {isPlaying ? <PauseIcon className="size-4 fill-current" /> : <PlayIcon className="size-4 fill-current ml-0.5" />}
          </button>

          {/* Slide Indicators: Full Rounded Circles for Inactive, Progress Pill for Active */}
          <div className="flex items-center gap-2 px-1">
            {items.map((item, index) => {
              const isActive = index === current;
              return (
                <button
                  key={item.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    goTo(index);
                  }}
                  className={`group relative transition-all duration-300 ${
                    isActive
                      ? "w-12 sm:w-14 h-3 rounded-full bg-foreground/20 overflow-hidden"
                      : "size-3 rounded-full bg-foreground/30 hover:bg-foreground/60"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                >
                  {isActive && (
                    <div
                      className="absolute inset-y-0 left-0 bg-signal rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Slide Counter */}
          <div className="pl-2 border-l border-border-soft pr-2 font-mono text-xs font-bold text-foreground tracking-wider tabular-nums">
            <span className="text-signal">{String(current + 1).padStart(2, "0")}</span>
            <span className="text-muted-foreground/60 mx-1">/</span>
            <span className="text-muted-foreground">{String(len).padStart(2, "0")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HeroCarouselSkeleton() {
  return (
    <div className="relative w-full h-[500px] sm:h-[580px] lg:h-[640px] overflow-hidden bg-background">
      <div className="absolute inset-0 w-full h-full shimmer" />
      <div className="absolute inset-x-0 bottom-0 z-20 pb-14 sm:pb-16 lg:pb-18">
        <div className="mx-auto w-full max-w-[1680px] px-4 sm:px-7 lg:px-10">
          <div className="space-y-4 max-w-2xl">
            <div className="shimmer h-4 w-24 rounded-full" />
            <div className="shimmer h-12 w-3/4 rounded-lg" />
            <div className="shimmer h-4 w-1/2 rounded" />
            <div className="shimmer h-12 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

