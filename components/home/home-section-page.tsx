import type { Route } from "next";
import { Suspense } from "react";
import { AnimeMediaGrid, AnimeMediaGridSkeleton } from "@/components/anime/anime-media-grid";
import { HomeSectionSeasonSubtitle } from "@/components/home/home-section-season-subtitle";
import { EmptyState } from "@/components/shared/empty-state";
import { getSectionHeadingId, SectionHeader } from "@/components/shared/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import type { HomeSectionId } from "@/lib/anilist/domain/home-sections";
import type { MediaCard } from "@/lib/anilist/domain/types";
import { HOME_SECTION_CLASS } from "@/lib/styles/home-section-layout";

type HomeSectionPageProps = {
  section: HomeSectionId;
  media: MediaCard[];
  title: string;
  subtitle?: string;
  /** Request-time season label for seasonal carousels. */
  seasonSubtitle?: "current" | "next";
  href?: Route;
  showCountdown?: boolean;
};

export function HomeSectionPage({
  media,
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
      {!media.length ? (
        <EmptyState title="No anime found" />
      ) : (
        <AnimeMediaGrid media={media} showCountdown={showCountdown} />
      )}
    </section>
  );
}

export function HomePageSectionsSkeleton() {
  return (
    <div className="flex flex-col gap-10" aria-busy="true" aria-label="Loading home sections">
      {Array.from({ length: 6 }, (_, index) => (
        <section key={index} className={HOME_SECTION_CLASS}>
          <Skeleton className="mb-4 h-7 w-48 max-w-full" aria-hidden />
          <AnimeMediaGridSkeleton layout="carousel" count={6} />
        </section>
      ))}
    </div>
  );
}
