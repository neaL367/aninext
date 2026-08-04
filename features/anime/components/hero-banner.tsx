import type { Media } from "@/features/anime/types/anime";
import { HeroInfo } from "./hero-content";

export function HeroBanner({ media }: { media: Media }) {
  return <HeroInfo media={media} />;
}

export function HeroBannerSkeleton() {
  return <div className="shimmer h-[70vh] min-h-[500px] w-full" />;
}
