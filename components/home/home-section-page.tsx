import type { Route } from "next";
import { Suspense } from "react";
import { AnimeMediaGrid } from "@/components/anime/anime-media-grid";
import { AnimeMediaGridSkeleton } from "@/components/anime/anime-media-grid";
import { HomeSectionSeasonSubtitle } from "@/components/home/home-section-season-subtitle";
import { EmptyState } from "@/components/shared/empty-state";
import { getSectionHeadingId, SectionHeader } from "@/components/shared/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import type { HomeSectionId } from "@/lib/anilist/domain/home-sections";
import { getHomeSectionMedia } from "@/lib/anilist/server/get-home-sections";
import { HOME_SECTION_CLASS } from "@/lib/styles/home-section-layout";

type HomeSectionPageProps = {
  section: HomeSectionId;
  title: string;
  subtitle?: string;
  /** Request-time season label for seasonal carousels. */
  seasonSubtitle?: "current" | "next";
  href?: Route;
  showCountdown?: boolean;
};

async function HomeSectionMediaGrid({
  section,
  showCountdown = false,
}: Pick<HomeSectionPageProps, "section" | "showCountdown">) {
  const media = await getHomeSectionMedia(section);

  if (!media.length) {
    return <EmptyState title="No anime found" />;
  }

  return <AnimeMediaGrid media={media} showCountdown={showCountdown} />;
}

export function HomeSectionPage({
  section,
  title,
  subtitle,
  seasonSubtitle,
  href,
  showCountdown = false,
}: HomeSectionPageProps) {
  const headingId = getSectionHeadingId(title);

  return (
    <section aria-labelledby={headingId} className={HOME_SECTION_CLASS}>
      <SectionHeader
        title={title}
        subtitle={subtitle}
        href={href}
        subtitleSlot={
          seasonSubtitle ? (
            <Suspense fallback={<Skeleton className="h-4 w-44 max-w-full" aria-hidden />}>
              <HomeSectionSeasonSubtitle season={seasonSubtitle} />
            </Suspense>
          ) : undefined
        }
      />
      <Suspense
        fallback={
          <div aria-busy="true" aria-label={`Loading ${title}`}>
            <AnimeMediaGridSkeleton layout="carousel" count={6} />
          </div>
        }
      >
        <HomeSectionMediaGrid section={section} showCountdown={showCountdown} />
      </Suspense>
    </section>
  );
}
