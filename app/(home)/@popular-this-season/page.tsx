import { connection } from "next/server";
import { Suspense } from "react";
import { HomeSectionSlot } from "@/components/home/home-section-slot";
import { SectionSkeleton } from "@/components/shared/section-skeleton";
import {
  formatSeasonLabel,
  getCurrentAnimeSeason,
} from "@/lib/anilist/utils/season";
import { HOME_SECTION_BROWSE_HREFS } from "@/lib/routes/browse-hrefs";

async function PopularThisSeasonContent() {
  await connection();
  const season = getCurrentAnimeSeason();

  return (
    <HomeSectionSlot
      title="Popular This Season"
      subtitle={formatSeasonLabel(season)}
      href={HOME_SECTION_BROWSE_HREFS.popularThisSeason}
      section="popularThisSeason"
    />
  );
}

export default function PopularThisSeasonSlot() {
  return (
    <Suspense fallback={<SectionSkeleton />}>
      <PopularThisSeasonContent />
    </Suspense>
  );
}
