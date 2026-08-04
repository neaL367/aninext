"use client";

import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { Media } from "@/features/anime/types/anime";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { HeroContent } from "./hero-content";

export function HeroCarousel({ items }: { items: Media[] }) {
  const [animate, setAnimate] = useState(false);
  const [api, setApi] = useState<any>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setAnimate(!mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!api) return;
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  return (
    <div className="relative w-full">
      <Carousel
        className="w-full"
        aria-label="Featured trending anime"
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={animate ? [Autoplay({ delay: 6000, stopOnInteraction: true })] : []}
      >
        <CarouselContent className="ml-0">
          {items.map((media) => (
            <CarouselItem key={media.id} className="pl-0">
              <HeroContent media={media} showGenres />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4 hidden size-10 rounded-full border-border/40 bg-background/60 backdrop-blur-sm sm:flex">
          <ChevronLeftIcon className="size-4" />
        </CarouselPrevious>
        <CarouselNext className="right-4 hidden size-10 rounded-full border-border/40 bg-background/60 backdrop-blur-sm sm:flex">
          <ChevronRightIcon className="size-4" />
        </CarouselNext>
      </Carousel>

      {/* Dot indicators */}
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 sm:bottom-10">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => api?.scrollTo?.(i)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === current
                ? "w-8 bg-white"
                : "w-1.5 bg-white/40 hover:bg-white/60"
            )}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export function HeroCarouselSkeleton() {
  return <div className="shimmer h-[70vh] min-h-[500px] w-full" />;
}
