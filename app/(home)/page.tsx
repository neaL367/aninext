import { HomeSectionPage } from "@/components/home/home-section-page";
import { HOME_SECTION_BROWSE_HREFS } from "@/lib/browse/url";

export default function HomePage() {
  return (
    <>
      <header className="flex max-w-prose flex-col gap-2 pb-2">
        <p className="text-sm font-medium text-muted-foreground">Anime discovery</p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Find your next anime
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Browse trending, seasonal, and airing titles from AniList — with filters, schedules, and
          detail pages that stay out of the way.
        </p>
      </header>

      <HomeSectionPage
        section="trending"
        title="Trending Now"
        subtitle="The most active anime in the past hour"
        href={HOME_SECTION_BROWSE_HREFS.trending}
      />
      <HomeSectionPage
        section="airingNow"
        title="Airing Now"
        subtitle="Popular anime currently releasing"
        href={HOME_SECTION_BROWSE_HREFS.airingNow}
        showCountdown
      />
      <HomeSectionPage
        section="popularThisSeason"
        title="Popular This Season"
        subtitle="The season's most popular picks"
        href={HOME_SECTION_BROWSE_HREFS.popularThisSeason}
        seasonSubtitle="current"
      />
      <HomeSectionPage
        section="upcomingNextSeason"
        title="Upcoming Next Season"
        subtitle="Next season's most anticipated anime"
        href={HOME_SECTION_BROWSE_HREFS.upcomingNextSeason}
        seasonSubtitle="next"
      />
      <HomeSectionPage
        section="allTimePopular"
        title="All-Time Popular"
        subtitle="The biggest anime on AniList"
        href={HOME_SECTION_BROWSE_HREFS.allTimePopular}
      />
      <HomeSectionPage
        section="top100"
        title="Top 100"
        subtitle="Highest-rated anime across AniList"
        href={HOME_SECTION_BROWSE_HREFS.top100}
      />
    </>
  );
}
