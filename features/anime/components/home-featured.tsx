import { io } from "next/cache";

import { getGenres, getHomeBucket, getHomeFeed } from "@/features/anime/anime-queries";
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

// Every section reads the same cached feed, so the homepage costs one upstream
// request per 5-minute window instead of four.
export async function HomeHero() {
  await io();
  const { trending } = await getHomeFeed(getHomeBucket());
  const items = trending.slice(0, 5);
  return items.length > 0 ? <HeroCarousel items={items} /> : null;
}

export async function HomeTrending() {
  await io();
  const { trending } = await getHomeFeed(getHomeBucket());
  return <TrendingIndex items={trending.slice(0, 7)} />;
}

export async function HomeSeason() {
  await io();
  const { popular } = await getHomeFeed(getHomeBucket());
  return <SeasonMosaic title="This season" href="/anime/popular" items={popular.slice(0, 5)} />;
}

export async function HomeTonight() {
  await io();
  const { airingSchedules } = await getHomeFeed(getHomeBucket());
  return <AiringHomeSection schedules={airingSchedules} />;
}

export async function HomeRanking() {
  await io();
  const { top100 } = await getHomeFeed(getHomeBucket());
  return <RankingList title="Top 100" href="/anime/top100" items={top100} />;
}

export async function HomeUpcoming() {
  await io();
  const { upcoming } = await getHomeFeed(getHomeBucket());
  return <UpcomingStrip title="Coming soon" href="/anime/upcoming" items={upcoming.slice(0, 4)} />;
}

export async function HomeGenres() {
  await io();
  const genres = (await getGenres()).filter(
    (genre) => !FILTER_ADULT_GENRES.some((adultGenre) => adultGenre === genre),
  );
  return <GenreIndex genres={genres} />;
}
