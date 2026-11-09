import { io } from "next/cache";

import {
  getGenres,
  getHomePrimaryBatch,
  getHomeSecondaryBatch,
  getTop100Preview,
} from "@/features/anime/anime-queries";
import { FILTER_ADULT_GENRES } from "@/features/anime/lib/filter-constants";

import { AiringHomeSection } from "./airing-home-section";
import { HeroCarousel } from "./hero-carousel";
import {
  GenreIndex,
  RankingList,
  SeasonMosaic,
  TrendingIndex,
  UpcomingStrip,
} from "./home-sections";

export function HomeFeaturedShell({
  hero,
  children,
}: {
  hero: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      {hero}
      <div className="mx-auto flex w-full max-w-[1760px] flex-col gap-16 px-4 py-14 sm:gap-20 sm:px-7 sm:py-16 lg:gap-24 lg:px-10 lg:py-20">
        {children}
      </div>
    </div>
  );
}

export async function HomeHero() {
  await io();
  const { trending } = await getHomePrimaryBatch();
  const items = trending.slice(0, 5);
  return items.length > 0 ? <HeroCarousel items={items} /> : null;
}

export async function HomeTrending() {
  await io();
  const { trending } = await getHomePrimaryBatch();
  return <TrendingIndex items={trending.slice(0, 7)} />;
}

export async function HomeSeason() {
  await io();
  const { popular } = await getHomePrimaryBatch();
  return <SeasonMosaic title="This season" href="/anime/popular" items={popular.slice(0, 5)} />;
}

export async function HomeTonight() {
  await io();
  const now = Math.floor(Date.now() / 1000);
  const bucket = Math.floor(now / 300) * 300;
  const { airingSchedules } = await getHomeSecondaryBatch(bucket - 43_200, bucket + 129_600);
  return <AiringHomeSection schedules={airingSchedules} />;
}

export async function HomeRanking() {
  await io();
  const items = await getTop100Preview(10);
  return <RankingList title="Top 100" href="/anime/top100" items={items} />;
}

export async function HomeUpcoming() {
  await io();
  const now = Math.floor(Date.now() / 1000);
  const bucket = Math.floor(now / 300) * 300;
  const { upcoming } = await getHomeSecondaryBatch(bucket - 43_200, bucket + 129_600);
  return <UpcomingStrip title="Coming soon" href="/anime/upcoming" items={upcoming.slice(0, 4)} />;
}

export async function HomeGenres() {
  await io();
  const genres = (await getGenres()).filter(
    (genre) => !FILTER_ADULT_GENRES.some((adultGenre) => adultGenre === genre),
  );
  return <GenreIndex genres={genres} />;
}
