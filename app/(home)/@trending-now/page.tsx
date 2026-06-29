import { Suspense } from "react";
import { HomeSectionSlot } from "@/components/home/home-section-slot";
import { SectionSkeleton } from "@/components/shared/section-skeleton";
import { HOME_SECTION_BROWSE_HREFS } from "@/lib/routes/browse-hrefs";

export default function TrendingNowSlot() {
  return (
    <Suspense fallback={<SectionSkeleton />}>
      <HomeSectionSlot
        title="Trending Now"
        subtitle="The most active anime in the past hour"
        href={HOME_SECTION_BROWSE_HREFS.trending}
        section="trending"
      />
    </Suspense>
  );
}
