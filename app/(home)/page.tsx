import { HomePageSectionsSkeleton, HomeSectionPage } from "@/components/home/home-section-page";
import { getHomePageSections } from "@/lib/anilist/server/get-home-sections";
import { HOME_SECTION_BROWSE_HREFS } from "@/lib/browse/url";
import { Suspense } from "react";
import type { HomeSectionId } from "@/lib/anilist/domain/home-sections";

function HomePageSections() {
  return (
    <div className="space-y-12">
      <SectionWrapper section="trending" title="Trending Now" subtitle="The most active anime in the past hour" />
      <SectionWrapper section="airingNow" title="Airing Now" subtitle="Popular anime currently releasing" showCountdown />
      <SectionWrapper section="popularThisSeason" title="Popular This Season" subtitle="The season's most popular picks" seasonSubtitle="current" />
      <SectionWrapper section="upcomingNextSeason" title="Upcoming Next Season" subtitle="Next season's most anticipated anime" seasonSubtitle="next" />
      <SectionWrapper section="allTimePopular" title="All-Time Popular" subtitle="The biggest anime on AniList" />
      <SectionWrapper section="top100" title="Top 100 Anime" subtitle="Highest-rated anime across AniList" />
    </div>
  );
}

async function SectionWrapper({ 
  section, 
  title, 
  subtitle, 
  ...props 
}: { 
  section: HomeSectionId, 
  title: string, 
  subtitle: string, 
  [key: string]: any 
}) {
  return (
    <Suspense fallback={<HomePageSectionsSkeleton />}>
      <SectionContent section={section} title={title} subtitle={subtitle} {...props} />
    </Suspense>
  );
}

async function SectionContent({ 
  section, 
  title, 
  subtitle, 
  ...props 
}: { 
  section: HomeSectionId, 
  title: string, 
  subtitle: string, 
  [key: string]: any 
}) {
  const sections = await getHomePageSections();
  const media = (sections as any)[section];
  
  return (
    <HomeSectionPage
      section={section}
      media={media}
      title={title}
      subtitle={subtitle}
      href={HOME_SECTION_BROWSE_HREFS[section as keyof typeof HOME_SECTION_BROWSE_HREFS]}
      {...props}
    />
  );
}

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

      <HomePageSections />
    </>
  );
}
