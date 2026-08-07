import { io } from "next/cache";

import { getHomeData } from "@/features/anime/anime-queries";
import { getCurrentSeason } from "@/features/anime/lib/season";

import { AiringHomeSection, AiringHomeSectionSkeleton } from "./airing-home-section";
import { FeatureMosaic, FeatureMosaicSkeleton } from "./feature-mosaic";
import { GenreExplorer, GenrePillsSkeleton } from "./genre-pills";
import { HeroCarousel, HeroCarouselSkeleton } from "./hero-carousel";
import { SectionRow, SectionRowSkeleton } from "./section-row";

export async function HomeFeatured() {
  await io();
  const current = getCurrentSeason();
  // eslint-disable-next-line react-hooks/purity -- streaming region, time-of-request is intended
  const now = Math.floor(Date.now() / 1000);
  const bucket = Math.floor(now / 300) * 300;
  const start = bucket - 43200;
  const end = bucket + 129600;
  const data = await getHomeData(start, end, current.season, current.seasonYear);

  return (
    <div className="home-page">
      {data.hero.length > 0 && <HeroCarousel items={data.hero} />}

      <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-16 px-4 py-14 sm:px-7 sm:py-20 lg:gap-24 lg:px-10">
        <SectionRow
          title="Trending now"
          href="/anime/trending"
          items={data.trending}
          description="The titles people are watching right now."
        />
        {data.popular.length > 0 && (
          <FeatureMosaic title="Popular this season" href="/anime/popular" items={data.popular} />
        )}
        <AiringHomeSection schedules={data.airing} />
        <SectionRow
          title="Top 100"
          href="/anime/top100"
          items={data.top100}
          description="A measured ranking of anime with staying power."
          showRank
        />
        <SectionRow
          title="Coming soon"
          href="/anime/upcoming"
          items={data.upcoming}
          description="Not yet released, already on the radar."
        />
        <SectionRow
          title="All time"
          href="/anime/alltimepopular"
          items={data.alltimepopular}
          description="Enduring favorites with lasting appeal."
        />
        <GenreExplorer genres={data.genres} />
      </div>
    </div>
  );
}

export function HomeFeaturedSkeleton() {
  return (
    <div className="home-page">
      <HeroCarouselSkeleton />
      <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-16 px-4 py-14 sm:px-7 sm:py-20 lg:gap-24 lg:px-10">
        <SectionRowSkeleton />
        <FeatureMosaicSkeleton />
        <AiringHomeSectionSkeleton />
        <SectionRowSkeleton />
        <SectionRowSkeleton count={5} />
        <SectionRowSkeleton count={5} />
        <GenrePillsSkeleton />
      </div>
    </div>
  );
}
