import { Suspense } from "react";
import { HomeSectionSlot } from "@/components/home/home-section-slot";
import { SectionSkeleton } from "@/components/shared/section-skeleton";
import { HOME_SECTION_BROWSE_HREFS } from "@/lib/routes/browse-hrefs";

export default function AllTimePopularSlot() {
  return (
    <Suspense fallback={<SectionSkeleton />}>
      <HomeSectionSlot
        title="All Time Popular"
        subtitle="The most popular anime on AniList"
        href={HOME_SECTION_BROWSE_HREFS.allTimePopular}
        section="allTimePopular"
      />
    </Suspense>
  );
}
