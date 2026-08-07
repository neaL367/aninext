import { io } from "next/cache";

import { getAiringWeek, getBrowseCollection, getGenres } from "@/features/anime/anime-queries";
import { getCurrentSeason } from "@/features/anime/lib/season";

import { AiringHomeSection } from "./airing-home-section";
import { FeatureMosaic } from "./feature-mosaic";
import { GenreExplorer } from "./genre-pills";
import { HeroCarousel } from "./hero-carousel";
import { SectionRow } from "./section-row";

import type { AnimeCollection } from "@/features/anime/types/anime";
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
  const { items } = await getBrowseCollection("trending", {}, 1, 5);
  return items.length > 0 ? <HeroCarousel items={items} /> : null;
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
  const currentSeason = collection === "popular" ? getCurrentSeason() : undefined;
  const { items } = await getBrowseCollection(collection, {}, 1, perPage, currentSeason);

  if (mosaic) return <FeatureMosaic title={title} href={href} items={items} />;

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
  // Cache bucket keeps this read stable while allowing schedule updates during the day.
  const now = Math.floor(Date.now() / 1000);
  const bucket = Math.floor(now / 300) * 300;
  const schedules = await getAiringWeek(bucket - 43_200, bucket + 129_600);
  return <AiringHomeSection schedules={schedules} />;
}

export async function HomeGenreSection() {
  const genres = await getGenres();
  return <GenreExplorer genres={genres} />;
}
