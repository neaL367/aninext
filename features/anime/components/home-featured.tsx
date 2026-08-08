import { io } from "next/cache";

import {
  getGenres,
  getHomePrimaryBatch,
  getHomeSecondaryBatch,
  getTop100Full,
} from "@/features/anime/anime-queries";

import { AiringHomeSection } from "./airing-home-section";
import { EditorialBanner } from "./editorial-banner";
import { FeatureMosaic } from "./feature-mosaic";
import { GenreExplorer } from "./genre-pills";
import { HeroCarousel } from "./hero-carousel";
import { SectionRow } from "./section-row";
import { Top100Podium } from "./top100-podium";
import { TrendingShowcase } from "./trending-showcase";
import { UpcomingReel } from "./upcoming-reel";

import type { AnimeCollection, Media } from "@/features/anime/types/anime";
import type { Route } from "next";

export function HomeFeaturedShell({
  hero,
  children,
}: {
  hero: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="home-page">
      {hero}
      <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-16 px-4 py-14 sm:px-7 sm:py-20 lg:gap-24 lg:px-10">
        {children}
      </div>
    </div>
  );
}

export async function HomeHero() {
  await io();
  const { trending } = await getHomePrimaryBatch();
  const heroItems = trending.slice(0, 5);
  return heroItems.length > 0 ? <HeroCarousel items={heroItems} /> : null;
}

export async function HomeCollectionSection({
  collection,
  title,
  href,
  perPage,
  description,
  showRank = false,
  mosaic = false,
}: {
  collection: AnimeCollection;
  title: string;
  href: Route<string>;
  perPage: number;
  description?: string;
  showRank?: boolean;
  mosaic?: boolean;
}) {
  await io();
  let items: Media[] = [];

  if (collection === "trending" || collection === "popular") {
    const batch = await getHomePrimaryBatch();
    items =
      collection === "trending"
        ? batch.trending.slice(0, perPage)
        : batch.popular.slice(0, perPage);
  } else if (collection === "top100") {
    const top100 = await getTop100Full();
    items = top100.slice(0, perPage);
  } else if (collection === "upcoming" || collection === "alltimepopular") {
    const now = Math.floor(Date.now() / 1000);
    const bucket = Math.floor(now / 300) * 300;
    const batch = await getHomeSecondaryBatch(bucket - 43_200, bucket + 129_600);
    items =
      collection === "upcoming"
        ? batch.upcoming.slice(0, perPage)
        : batch.alltimepopular.slice(0, perPage);
  }

  if (collection === "trending") return <TrendingShowcase items={items} />;
  if (collection === "popular" || mosaic)
    return <FeatureMosaic title={title} href={href} items={items} />;
  if (collection === "top100") return <Top100Podium title={title} href={href} items={items} />;
  if (collection === "upcoming")
    return <UpcomingReel title={title} href={href} items={items} description={description} />;
  if (collection === "alltimepopular" && items.length > 0) {
    return (
      <div className="space-y-16">
        <EditorialBanner item={items[0]} />
        <SectionRow
          title={title}
          href={href}
          items={items.slice(1)}
          description={description}
          showRank={showRank}
        />
      </div>
    );
  }

  return (
    <SectionRow
      title={title}
      href={href}
      items={items}
      description={description}
      showRank={showRank}
    />
  );
}

export async function HomeAiringSection() {
  await io();
  const now = Math.floor(Date.now() / 1000);
  const bucket = Math.floor(now / 300) * 300;
  const { airingSchedules } = await getHomeSecondaryBatch(bucket - 43_200, bucket + 129_600);
  return <AiringHomeSection schedules={airingSchedules} />;
}

export async function HomeGenreSection() {
  const genres = await getGenres();
  return <GenreExplorer genres={genres} />;
}
