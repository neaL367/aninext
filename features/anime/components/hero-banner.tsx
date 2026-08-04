import type { Media } from "@/features/anime/types/anime";
import { HeroContent } from "./hero-content";

export function HeroBanner({ media }: { media: Media }) {
  return <HeroContent media={media} />;
}

export function HeroBannerSkeleton() {
  return <div className="shimmer h-[70vh] min-h-[500px] w-full" />;
}
