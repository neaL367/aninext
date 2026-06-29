import { connection } from "next/server";
import { Suspense } from "react";
import { HomeSectionSlot } from "@/components/home/home-section-slot";
import { SectionSkeleton } from "@/components/shared/section-skeleton";
import {
  formatSeasonLabel,
  getNextAnimeSeason,
} from "@/lib/anilist/utils/season";
import { HOME_SECTION_BROWSE_HREFS } from "@/lib/routes/browse-hrefs";

async function UpcomingNextSeasonContent() {
  await connection();
  const season = getNextAnimeSeason();

  return (
    <HomeSectionSlot
      title="Upcoming Next Season"
      subtitle={formatSeasonLabel(season)}
      href={HOME_SECTION_BROWSE_HREFS.upcomingNextSeason}
      section="upcomingNextSeason"
    />
  );
}

export default function UpcomingNextSeasonSlot() {
  return (
    <Suspense fallback={<SectionSkeleton />}>
      <UpcomingNextSeasonContent />
    </Suspense>
  );
}
