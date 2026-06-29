import { Suspense } from "react";
import { HomeSectionSlot } from "@/components/home/home-section-slot";
import { SectionSkeleton } from "@/components/shared/section-skeleton";
import { HOME_SECTION_BROWSE_HREFS } from "@/lib/routes/browse-hrefs";

export default function AiringNowSlot() {
  return (
    <Suspense fallback={<SectionSkeleton />}>
      <HomeSectionSlot
        title="Airing Now"
        subtitle="Popular anime currently releasing"
        href={HOME_SECTION_BROWSE_HREFS.airingNow}
        section="airingNow"
        showCountdown
      />
    </Suspense>
  );
}
