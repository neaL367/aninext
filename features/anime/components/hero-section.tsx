import { getBrowseCollection } from "@/features/anime/anime-queries";

import { HeroCarousel } from "./hero-carousel";

export async function HeroSection() {
  const { items } = await getBrowseCollection("trending", {}, 1, 5);
  if (items.length === 0) return null;
  return <HeroCarousel items={items} />;
}
