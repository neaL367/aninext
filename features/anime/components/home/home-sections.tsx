import { connection } from "next/server";

import { getBrowseCollection, getAiringWeek } from "@/features/anime/anime-queries";

import { AiringHomeSection } from "../airing/airing-home-section";
import { FeatureMosaic } from "./feature-mosaic";
import { HeroCarousel } from "./hero-carousel";
import { SectionRow } from "./section-row";

export async function HeroSection() {
  const { items } = await getBrowseCollection("trending", {}, 1, 5);
  if (items.length === 0) return null;
  return <HeroCarousel items={items} />;
}

export async function TrendingSection() {
  const { items } = await getBrowseCollection("trending", {}, 1, 14);
  return (
    <SectionRow
      title="Trending now"
      href="/anime/trending"
      items={items}
      description="The titles people are watching right now."
    />
  );
}

export async function PopularSection() {
  const { items } = await getBrowseCollection("popular", {}, 1, 5);
  return <FeatureMosaic title="Popular this season" href="/anime/popular" items={items} />;
}

export async function AiringSection() {
  await connection();
  // eslint-disable-next-line react-hooks/purity -- streaming region, time-of-request is intended
  const now = Math.floor(Date.now() / 1000);
  const start = now - 43200;
  const end = now + 129600;
  const schedules = await getAiringWeek(start, end);
  return <AiringHomeSection schedules={schedules} />;
}

export async function Top100Section() {
  const { items } = await getBrowseCollection("top100", {}, 1, 14);
  return (
    <SectionRow
      title="Top 100"
      href="/anime/top100"
      items={items}
      description="A measured ranking of anime with staying power."
      showRank
    />
  );
}

export async function UpcomingSection() {
  const { items } = await getBrowseCollection("upcoming", {}, 1, 7);
  return (
    <SectionRow
      title="Coming soon"
      href="/anime/upcoming"
      items={items}
      description="Not yet released, already on the radar."
    />
  );
}

export async function AllTimePopularSection() {
  const { items } = await getBrowseCollection("alltimepopular", {}, 1, 7);
  return (
    <SectionRow
      title="All time"
      href="/anime/alltimepopular"
      items={items}
      description="Enduring favorites with lasting appeal."
    />
  );
}
