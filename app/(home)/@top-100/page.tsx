import { Suspense } from "react";
import { HomeSectionSlot } from "@/components/home/home-section-slot";
import { SectionSkeleton } from "@/components/shared/section-skeleton";
import { HOME_SECTION_BROWSE_HREFS } from "@/lib/routes/browse-hrefs";

export default function Top100Slot() {
  return (
    <Suspense fallback={<SectionSkeleton />}>
      <HomeSectionSlot
        title="Top 100"
        subtitle="Highest rated anime on AniList"
        href={HOME_SECTION_BROWSE_HREFS.top100}
        section="top100"
      />
    </Suspense>
  );
}
